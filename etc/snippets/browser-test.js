/*
 * INSTRUCTIONS
 *
 * - Open http://127.0.0.1:8000/incontrol.web/detail.aspx in a browser window (to prevent CORS-issues)
 * - Open the developer console
 * - Copy & paste this content into the console
 * - Modify the body of the `run`-function, if necessary
 * - Press enter-key
 */

(async () => {
    // CONSTANTS

    const URL__MAIN = 'http://127.0.0.1:8000/incontrol.web/detail.aspx';

    // CLASSES

    class LightPattern {
        static dim(action, levels) {
            const actions = [];
            for (let i = 0; i < levels; i++) {
                actions.push(action);
            }
            return actions;
        }
        static spread(commands, duration) {
            return commands.reduce((res, command, idx, arr) => {
                res.push(command);
                if (idx === arr.length - 1) return res;
                res.push(Command.wait(duration));
                return res;
            }, []);
        }

        static shutterRow(idxRow, { spread = 250 } = {}) {
            return LightPattern.spread(
                [
                    ...LightPattern.byLuminairePattern(
                        Action.on,
                        LuminairePatternBuilder.getRow,
                        idxRow
                    ),
                    Command.wait(500),
                    ...LightPattern.byLuminairePattern(
                        Action.off,
                        LuminairePatternBuilder.getRow,
                        idxRow,
                        { fromRightToLeft: true }
                    ),
                ],
                spread
            );
        }
        static dimSingle(action, levels, coords) {
            return LightPattern.dimArea(action, levels, coords, coords);
        }
        static dimArea(action, levels, coordsLeftTop, coordsRightBottom) {
            return LightPattern.byLuminairePattern(
                LightPattern.dim(action, levels),
                LuminairePatternBuilder.getArea,
                coordsLeftTop,
                coordsRightBottom
            );
        }
        static switchOffArea(coordsLeftTop, coordsRightBottom) {
            return LightPattern.byLuminairePattern(
                Action.off,
                LuminairePatternBuilder.getArea,
                coordsLeftTop,
                coordsRightBottom
            );
        }
        static switchOnArea(coordsLeftTop, coordsRightBottom) {
            return LightPattern.byLuminairePattern(
                Action.on,
                LuminairePatternBuilder.getArea,
                coordsLeftTop,
                coordsRightBottom
            );
        }
        static switchOffSingle(coords) {
            return LightPattern.switchOffArea(coords, coords);
        }
        static switchOnSingle(coords) {
            return LightPattern.switchOnArea(coords, coords);
        }
        static byLuminairePattern(action, luminairePattern, ...args) {
            if (typeof action === 'function') action = action();
            const actions = Array.isArray(action) ? action.slice() : [action];
            return actions.reduce((res, action) => {
                res.splice(
                    res.length,
                    0,
                    ...luminairePattern
                        .apply(null, args)
                        .map((luminaire) => new Command(luminaire, action))
                );
                return res;
            }, []);
        }
        static marqueeColumn(column, duration) {
            return []
                .concat(
                    LightPattern.byLuminairePattern(
                        Action.on,
                        LuminairePatternBuilder.getColumn,
                        column
                    )
                )
                .concat([Command.wait(duration)])
                .concat(
                    LightPattern.byLuminairePattern(
                        Action.off,
                        LuminairePatternBuilder.getColumn,
                        column
                    )
                );
        }
    }

    class Action {
        static brighter = {
            x: 64,
            y: 19,
        };
        static darker = {
            x: 64,
            y: 89,
        };
        static off = {
            x: 19,
            y: 89,
        };
        static on = {
            x: 19,
            y: 19,
        };
    }

    class Command {
        luminaire;
        action;

        static wait(duration) {
            return new Command(
                null,
                () =>
                    new Promise((resolve) =>
                        window.setTimeout(resolve, duration)
                    )
            );
        }

        constructor(luminaire, action) {
            this.luminaire = luminaire;
            this.action = action;
        }

        getActionCoords() {
            return {
                'ctl00$cphBody$ibLight.x': this.action.x,
                'ctl00$cphBody$ibLight.y': this.action.y,
            };
        }
    }

    class CommandQueue {
        _queue = [];
        _concurrent = false;

        static async executeCommand(responseHtml, command) {
            if (!command.luminaire) {
                await command.action();
                return responseHtml;
            }
            try {
                responseHtml = await command.luminaire.select(responseHtml);
                return await Request.post(getForm(responseHtml), {
                    data: command.getActionCoords(),
                });
            } catch (e) {
                // Proceed if a single command can't be executed
                console.warn(e);
                return responseHtml;
            }
        }

        static async run(responseHtml, commands, { concurrent } = {}) {
            return await new CommandQueue({ concurrent })
                .add(commands)
                .run(responseHtml);
        }

        constructor({ concurrent = false } = {}) {
            // Run all luminaires concurrently, but all commands for each luminaire sequentially
            this._concurrent = concurrent;
        }

        add(command) {
            if (Array.isArray(command)) {
                this._queue.splice(this._queue.length, 0, ...command);
            } else {
                this._queue.push(command);
            }
            return this;
        }

        async run(responseHtml) {
            return this._concurrent
                ? this._runConcurrently(responseHtml)
                : this._runSequentially(responseHtml);
        }

        async *_asyncGeneratorCommandQueue(responseHtml, commands) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command.luminaire?.disabled) {
                    yield responseHtml;
                    continue;
                }
                responseHtml = await CommandQueue.executeCommand(
                    responseHtml,
                    command
                );
                yield responseHtml;
            }
            return responseHtml;
        }

        async _runSequentially(responseHtml) {
            const genCommands = this._asyncGeneratorCommandQueue(
                responseHtml,
                this._queue
            );
            for await (const result of genCommands) {
                responseHtml = result;
            }
            return responseHtml;
        }

        async _runConcurrently(responseHtml) {
            return (
                await Promise.all(
                    Array.from(
                        this._queue
                            // Group commands by luminaire-name
                            .reduce((res, command) => {
                                const name = command.luminaire?.name;
                                let queue = res.get(name);
                                if (!queue) {
                                    queue = [];
                                    res.set(name, queue);
                                }
                                queue.push(command);
                                return res;
                            }, new Map())
                            .values()
                    ).map((commands) => {
                        const queue = new CommandQueue();
                        queue.add(commands);
                        return queue.run(responseHtml);
                    })
                )
            ).pop();
        }
    }

    class Luminaire {
        // Luminaires that don't exist (in a rectangular pattern, e.g. OG1_SUED), or may cause issues
        static DISABLED_LUMINAIRES = ['Leuchte_R21G01B12'];

        static _luminaires = new Map();

        static get(name) {
            return Luminaire._luminaires.get(name);
        }

        disabled = false;

        constructor(name) {
            this.name = name;
            this.disabled = Luminaire.DISABLED_LUMINAIRES.includes(name);
            Luminaire._luminaires.set(name, this);
        }

        getNode(responseHtml) {
            return Array.from(
                responseHtml.querySelectorAll('a.ctl00_cphBody_tvDevices_0')
            )
                .filter((node) => node.textContent === this.name)
                .pop();
        }

        async select(responseHtml) {
            const luminaireNode = this.getNode(responseHtml, this.name);
            if (!luminaireNode) {
                // This only happens when the `LuminairePatternBuilder` creates a rectangular map of a floor,
                // where the luminaires are not installed in a fully rectangular way (e.g. `OG1_SUED`)
                throw new Error(`luminaire "${this.name}" could not be found`);
            }
            const form = getForm(responseHtml);
            form['ctl00_cphBody_tvDevices_SelectedNode'].value =
                luminaireNode.id;
            return await Request.post(form);
        }
    }

    class LuminairePatternBuilder {
        static luminaires = LuminairePatternBuilder._createLuminaireMatrix({
            pattern: 'Leuchte_R21G{colnum}B{rownum}',
            columnNumbers: [1, 13, 25, 37],
            rowStartIndices: [1, 13, 25, 37],
            rows: 12,
        });

        static getSingle(coords) {
            return LuminairePatternBuilder.getArea(coords, coords);
        }
        static getArea(
            coordsLeftTop = [0, 0],
            coordsRightBottom = [
                LuminairePatternBuilder.luminaires.length,
                LuminairePatternBuilder.luminaires[0].length,
            ]
        ) {
            return LuminairePatternBuilder.luminaires.reduce(
                (res, col, idxCol) => {
                    if (
                        idxCol < coordsLeftTop[0] ||
                        idxCol > coordsRightBottom[0]
                    )
                        return res;
                    col.forEach((row, idxRow) => {
                        if (
                            idxRow < coordsLeftTop[1] ||
                            idxRow > coordsRightBottom[1]
                        )
                            return;
                        res.push(
                            LuminairePatternBuilder.luminaires[idxCol][idxRow]
                        );
                    });
                    return res;
                },
                []
            );
        }
        static getColumn(idx) {
            return LuminairePatternBuilder.luminaires[idx];
        }
        static getRow(idx, { fromRightToLeft } = {}) {
            const luminaires = LuminairePatternBuilder.luminaires;
            const cols = fromRightToLeft
                ? luminaires.slice().reverse()
                : luminaires;
            return cols.reduce((res, column) => {
                res.push(column[idx]);
                return res;
            }, []);
        }
        static getSpiral() {
            const pattern = [];
            const cols = LuminairePatternBuilder.luminaires.length;
            const rows = LuminairePatternBuilder.luminaires[0].length;

            for (const luminaire of genSpiral(cols, rows)) {
                pattern.push(luminaire);
            }
            return pattern;

            function* genSpiral(cols, rows) {
                const directions = ['right', 'down', 'left', 'up'];
                // [x, y]: top-right, bottom-right, bottom-left, top-left
                const limits = [
                    [cols - 1, 0],
                    [cols - 1, rows - 1],
                    [0, rows - 1],
                    [0, 1],
                ];
                let idxDirection = 0;
                let idxLimit = 0;
                let coords = [0, 0];
                let direction = directions[idxDirection];
                for (let i = 0; i < cols * rows; i++) {
                    const limit = limits[idxLimit];
                    yield LuminairePatternBuilder.luminaires[coords[0]][
                        coords[1]
                    ];
                    coords = move(direction, coords);
                    if (reachedLimit(limit, coords)) {
                        limits[idxLimit] = narrowLimit(direction, limit);
                        idxLimit = ++idxLimit % limits.length;
                        idxDirection = ++idxDirection % directions.length;
                        direction = directions[idxDirection];
                    }
                }
            }

            function move(direction, [x, y]) {
                if (direction === 'right') return [x + 1, y];
                if (direction === 'down') return [x, y + 1];
                if (direction === 'left') return [x - 1, y];
                if (direction === 'up') return [x, y - 1];
                throw new Error(`Unknown direction ${direction}`);
            }

            function narrowLimit(direction, [x, y]) {
                if (direction === 'right') return [x - 1, y + 1];
                if (direction === 'down') return [x - 1, y - 1];
                if (direction === 'left') return [x + 1, y - 1];
                if (direction === 'up') return [x + 1, y + 1];
                throw new Error(`Unknown direction ${direction}`);
            }

            function reachedLimit([limX, limY], [x, y]) {
                return limX === x && limY === y;
            }
        }

        static _createLuminaireMatrix({
            pattern,
            columnNumbers,
            rowStartIndices,
            rows,
        }) {
            return columnNumbers.reduce((res, colNumber, idxCol) => {
                const resRows = [];
                for (let idxRow = 0; idxRow < rows; idxRow++) {
                    const name = pattern
                        .replace('{colnum}', `${colNumber}`.padStart(2, '0'))
                        .replace(
                            '{rownum}',
                            `${rowStartIndices[idxCol] + idxRow}`.padStart(
                                2,
                                '0'
                            )
                        );
                    resRows.push(new Luminaire(name));
                }
                res.push(resRows);
                return res;
            }, []);
        }
    }

    class Request {
        static async get() {
            const response = await fetch(URL__MAIN);
            return new DOMParser().parseFromString(
                await response.text(),
                'text/html'
            );
        }

        static async post(form, { data } = {}) {
            const searchParams = new URLSearchParams();
            for (const entry of new FormData(form)) {
                searchParams.append(entry[0], entry[1]);
            }
            if (data) {
                Object.entries(data).forEach(([key, value]) =>
                    searchParams.append(key, value)
                );
            }

            const response = await fetch(URL__MAIN, {
                method: 'POST',
                headers: {
                    Accept: 'text/html',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: searchParams.toString(),
            });
            return new DOMParser().parseFromString(
                await response.text(),
                'text/html'
            );
        }
    }

    // RUN SNIPPET

    await run();

    // IMPLEMENTATION DETAILS

    async function run() {
        try {
            const start = Date.now();
            let responseHtml = await Request.get();
            await new CommandQueue({ concurrent: false })
                .add(
                    LightPattern.byLuminairePattern(
                        Action.on,
                        LuminairePatternBuilder.getArea,
                        [0, 0],
                        [3, 11]
                    )
                )
                .add(
                    LightPattern.byLuminairePattern(
                        Action.off,
                        LuminairePatternBuilder.getArea,
                        [0, 0],
                        [3, 11]
                    )
                )
                .add(
                    LightPattern.byLuminairePattern(
                        Action.on,
                        LuminairePatternBuilder.getSpiral
                    )
                )
                .add(
                    LightPattern.byLuminairePattern(
                        Action.off,
                        LuminairePatternBuilder.getSpiral
                    )
                )
                .run(responseHtml);
            console.log(`Finished (${Date.now() - start}ms)`);
        } catch (e) {
            console.log(e);
        }
    }

    function getForm(responseHtml) {
        return responseHtml.forms.aspnetForm;
    }
})();

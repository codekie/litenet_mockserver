import { listen } from '@tauri-apps/api/event';
import { get, writable } from 'svelte/store';
import { EVENT_NEW_REQUEST } from '../constants/event';

export const current = writable(0);
export const max = writable(0);

export { format };

const MAX_FRAMES = 100;
const INTERVAL = 10;

let _frames = [0];

initGauge();

function initGauge() {
    const { set: setMax } = max;
    const { set: setCurrent } = current;

    window.setInterval(() => _updateFrame(setMax, setCurrent), INTERVAL);

    listen(EVENT_NEW_REQUEST, () => {
        const count = _frames[_frames.length - 1];
        _frames[_frames.length - 1] = count + 1;
    });
}

function format(value) {
    const fraction = Math.floor((value - Math.floor(value)) * 10);
    return `${Math.floor(value)}.${fraction}`;
}

function _updateFrame(setMax, setCurrent) {
    const curRatioAvg =
        Math.round(
            (_frames.reduce((res, val) => res + val, 0) / _frames.length) *
                ((1 / INTERVAL) * MAX_FRAMES) *
                10
        ) / 10;
    const maxVal = get(max);
    setMax(Math.max(curRatioAvg, maxVal));
    setCurrent(curRatioAvg);
    _frames.push(0);
    if (_frames.length > MAX_FRAMES) _frames.shift();
}

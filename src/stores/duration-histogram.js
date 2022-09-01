import { EVENT_LAST_CALL_TIMESTAMP } from '../constants/event';
import { listen } from '@tauri-apps/api/event';
import { get, writable } from 'svelte/store';

const SIZE_HISTOGRAM = 50;

let _lastTimestamp = writable(null);
let _lastTimestampRaw = writable(null);

export const cap = writable(2000);
export const max = writable(null);
export const avg = writable(null);
export const histogram = _createHistogramStore(_updateHistogram);

const _histogramRaw = _createHistogramStore(_updateHistogramRaw);

export { setCap, initHistogram };

async function initHistogram() {
    await listen(EVENT_LAST_CALL_TIMESTAMP, (event) => {
        const { update } = histogram;
        const lastTimestamp = event.payload;
        update((histogram) => _updateHistogram(histogram, lastTimestamp));
    });
    await listen(EVENT_LAST_CALL_TIMESTAMP, (event) => {
        const { update } = _lastTimestampRaw;
        const lastTimestamp = event.payload;
        update((histogram) => _updateHistogramRaw(histogram, lastTimestamp));
    });
}

function setCap(capValue) {
    cap.set(capValue);
    get(_histogramRaw).forEach(histogram.add);
}

function _createHistogramStore(updateHistogram) {
    const store = writable([]);
    const { subscribe, update, set } = store;
    return {
        subscribe,
        get: () => get(store),
        set,
        update,
        add: (duration) =>
            update((histogram) => updateHistogram(histogram, duration)),
    };
}

function _updateHistogram(histogram, timestamp) {
    let lastTimestamp = get(_lastTimestamp);
    if (lastTimestamp === null) {
        _lastTimestamp.set(timestamp);
        return histogram;
    }
    const duration = timestamp - lastTimestamp;
    const capVal = get(cap);
    if (duration > capVal) {
        _lastTimestamp.set(timestamp);
        return histogram;
    }
    histogram.push(duration);
    histogram.length === SIZE_HISTOGRAM && histogram.shift();
    max.set(histogram.reduce((res, val) => Math.max(res, val), 0));
    avg.set(
        Math.round(
            histogram.reduce((result, val) => result + val, 0) /
                histogram.length
        )
    );
    histogram.length === SIZE_HISTOGRAM && histogram.shift();
    _lastTimestamp.set(timestamp);
    return histogram;
}

function _updateHistogramRaw(histogram, timestamp) {
    let lastTimestamp = get(_lastTimestampRaw);
    if (lastTimestamp === null) {
        _lastTimestampRaw.set(timestamp);
        return histogram;
    }
    const duration = timestamp - lastTimestamp;
    histogram.push(duration);
    // We cap at twice the size of the histogram (to fill up the filtered values, when the cap has been
    // changed)
    histogram.length === 2 * SIZE_HISTOGRAM && histogram.shift();
    _lastTimestampRaw.set(timestamp);
    return histogram;
}

import { get, writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import {
    EVENT_TURNED_ON,
    EVENT_TURNED_OFF,
    EVENT_BRIGHTER,
    EVENT_DARKER,
    EVENT_SELECTED_LUMINAIRE,
} from '../constants/event.js';

export const room = createRoomStore();
export const selectedLuminaire = writable(null);
export const luminaires = writable(new Map());

function createRoomStore() {
    const { subscribe, set } = writable([]);
    return {
        subscribe,
        init: async () => {
            const rooms = await invoke('get_room', { name: 'og1sued' });
            Array.from(rooms.values()).forEach((cols) => {
                cols.forEach((luminaire) =>
                    luminaires.update((luminaires) =>
                        luminaires.set(luminaire.name, luminaire)
                    )
                );
            });
            await _bindEvents(luminaires, selectedLuminaire);
            set(rooms);
        },
    };
}

async function _bindEvents(luminaires, selectedLuminaire) {
    await listen(EVENT_SELECTED_LUMINAIRE, (event) => {
        console.log(EVENT_SELECTED_LUMINAIRE, event);
        const { name } = event.payload;
        const { update } = selectedLuminaire;
        update(() => name);
    });
    await listen(EVENT_TURNED_ON, (event) => {
        console.log(EVENT_SELECTED_LUMINAIRE, event);
        const { name, level } = event.payload;
        _updateLuminaire(luminaires, selectedLuminaire, name, level);
    });
    await listen(EVENT_TURNED_OFF, (event) => {
        console.log(EVENT_SELECTED_LUMINAIRE, event);
        const { name, level } = event.payload;
        _updateLuminaire(luminaires, selectedLuminaire, name, level);
    });
    await listen(EVENT_BRIGHTER, (event) => {
        console.log(EVENT_SELECTED_LUMINAIRE, event);
        const { name, level } = event.payload;
        _updateLuminaire(luminaires, selectedLuminaire, name, level);
    });
    await listen(EVENT_DARKER, (event) => {
        console.log(EVENT_SELECTED_LUMINAIRE, event);
        const { name, level } = event.payload;
        _updateLuminaire(luminaires, selectedLuminaire, name, level);
    });
}

function _updateLuminaire(luminaires, selectedLuminaire, name, levelIncrease) {
    const { update } = luminaires;
    update((luminaires) => {
        const name = get(selectedLuminaire);
        const luminaire = luminaires.get(name);
        luminaire.level = Math.min(
            Math.max(luminaire.level + levelIncrease, 0),
            100
        );
        return luminaires;
    });
}

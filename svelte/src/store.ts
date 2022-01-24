import { writable, Writable } from "svelte/store";
import { ANIME_DATA } from "./ts/types";

export type Settings = {
    scoreThreshold: number;
    popularityThreshold: number;
    startYear: number;
    endYear: number;
    username: string;
    distance: number;
};

export const scoreThreshold: Writable<number> = writable(0);
export const popularityThreshold: Writable<number> = writable(0);
export const startYear: Writable<number> = writable(1960);
export const endYear: Writable<number> = writable(2025);
export const distance: Writable<number> = writable(0);
export const username: Writable<string> = writable("");

export const selected_anime: Writable<ANIME_DATA> = writable();

export const completedList: Writable<number[]> = writable([]);
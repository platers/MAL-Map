import { writable, readable, Writable } from "svelte/store";
import { ANIME_DATA } from "../../data-collection/types";

export type Theme = "light" | "dark";
export type Settings = {
    theme: Theme;
    scoreThreshold: number;
    popularityThreshold: number;
    startYear: number;
    endYear: number;
    username: string;
    distance: number;
};

export const settings: Writable<Settings> = writable({
    theme: "dark",
    scoreThreshold: 0,
    popularityThreshold: 0,
    startYear: 1960,
    endYear: 2025,
    username: window.location.hash.substring(1),
    distance: 0,
});

export const selected_anime: Writable<ANIME_DATA> = writable();
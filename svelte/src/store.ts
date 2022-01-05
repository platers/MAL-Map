import { writable, readable, Writable } from "svelte/store";
import { ANIME_DATA } from "../../data-collection/types";

export type Theme = "light" | "dark";
export type Settings = {
    theme: Theme;
    scoreThreshold: number;
    popularityThreshold: number;
    username: string;
    distance: number;
};

const hash = window.location.hash.substring(1);
export const settings: Writable<Settings> = writable({
    theme: "dark",
    scoreThreshold: 0,
    popularityThreshold: 0,
    username: window.location.hash.substring(1),
    distance: 0,
});

export const selected_anime: Writable<ANIME_DATA> = writable();
import { METADATA } from "./base_types";

export class ANIME_DATA extends METADATA {
    id: number;
    title: string;
    englishTitle: string;
    url: string;
    picture: string;
    synopsis: string;
    score: number;
    type: string;
    genres: string[];
    ranked: number;
    popularity: number;
    members: number;
    related: { id: number, relation_type: string }[];
    recommendations: { id: number, count: number }[];
    year: number;
    nsfw: boolean;

};

export type ANIME_DICT = { [id: number]: ANIME_DATA; };
import { METADATA } from "./base_types";

export class MOVIE_DATA extends METADATA {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    url: string;
    runtime: string;
    year: string;
    related: { id: number, count: number }[];
    genres: string[];
    members: number;
    picture: string;
    score: number;
}

export type MOVIE_DICT = { [id: number]: MOVIE_DATA; };
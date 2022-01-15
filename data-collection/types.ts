
export type ANIME_DATA = {
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
    recommendations: { id: string, count: number }[];
    year: number;
};
export type ANIME_DICT = { [id: number]: ANIME_DATA; };

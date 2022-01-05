import { getRecommendationsList, getInfoFromURL } from "mal-scraper";
import { ANIME_DATA } from "./types";

export function getIdFromLink(link: string): number {
    const id = link.split('/')[4];
    return parseInt(id);
}

export async function getRecs(id: number) {
    const recs = await getRecommendationsList({ name: 'any', id: id });
    const map: { [id: number]: number } = {};

    for (const rec of recs) {
        if (!rec.animeLink) {
            throw new Error('No anime link found for rec ' + rec + ' in ' + name);
        }
        map[getIdFromLink(rec.animeLink)] = rec.otherRecommendations + 1;
    }

    return map;
}
export async function randomWait(minWait = 2000): Promise<void> {
    const random_wait = Math.floor(Math.random() * 3000) + minWait;
    return new Promise(resolve => {
        setTimeout(resolve, random_wait);
    });
}

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
export function execShellCommand(cmd) {
    const exec = require('child_process').exec;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}
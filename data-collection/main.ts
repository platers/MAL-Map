import { createCluster } from "./cluster";
import { Layout } from "./layout";
import { storeEdges } from "./recs";
import { storeMetadata, getIds, processMetadata, storeAniListMetadata } from "./shows";
import { ANIME_DICT } from "../svelte/src/ts/types";
const fs = require('fs');
const MAL_METADATA_FILENAME = 'data/metadata.json';
const ANILIST_METADATA_FILENAME = 'data/metadata-anilist.json';

main();

async function main() {
    // If reset flag, delete existing metadata and pull it again. Takes hours.
    if (process.argv.length === 3 && process.argv[2] === 'reset') {
        const ids = await getIds();
        fs.writeFileSync(MAL_METADATA_FILENAME, '{}');
        fs.writeFileSync(ANILIST_METADATA_FILENAME, '{}');
        await storeMetadata(ids);
        await storeAniListMetadata(ids);
    }

    // Load metadata
    const metadata_json = JSON.parse(fs.readFileSync(MAL_METADATA_FILENAME).toString());
    const anilist_metadata_json = JSON.parse(fs.readFileSync(ANILIST_METADATA_FILENAME).toString());
    let metadata: ANIME_DICT = processMetadata(metadata_json, anilist_metadata_json);

    // Get edges
    const edges = storeEdges(metadata);

    // Create clusters
    const root_cluster = await createCluster(edges);
    console.log("Finished clustering");
   
    // Layout clusters
    console.log("Starting layout");
    const layout = new Layout(root_cluster.toNodeDict(), edges, 20);
    while (!layout.done) {
        layout.tick();
    }
    fs.writeFileSync('data/layout.json', JSON.stringify(layout, null, 2));
}
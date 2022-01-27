<script lang="ts">
    import _ from "lodash";

    import Genres from "./Genres.svelte";
    import Stats from "./Stats.svelte";
    import { selected_anime } from "./store";
    import { nativeTitle } from "./ts/utils";
    import { ANIME_DATA } from "./ts/types";
    let metadata: ANIME_DATA;
    let genres = [];
    selected_anime.subscribe((anime) => {
        metadata = anime;
        if (anime) {
            genres = _.clone(anime.genres);
            if (anime.year) {
                genres.push(anime.year.toString());
            }
        }
    });
</script>

{#if metadata}
    <div>
        <a href={metadata.url} target="_blank" rel="noopener noreferrer">
            <img src={metadata.picture} alt="Anime Thumbnail" />
        </a>
        <h1>{nativeTitle(metadata)}</h1>
        <Stats {metadata} />

        <Genres {genres} />

        <div class="synopsis">
            <p>{metadata.synopsis}</p>
        </div>
    </div>
{/if}

<style lang="scss">
    img {
        margin-left: auto;
        margin-right: auto;
        display: block;
        height: 50%;
    }
    h1 {
        font-size: 1.7em;
        margin-top: 8px;
        margin-bottom: 8px;
    }
    h4 {
        padding-top: 0;
        margin: 0;
        font-weight: 50;
        opacity: 0.5;
    }
    a {
        color: var(--text-normal);
        text-decoration: none;
    }

    .synopsis {
        height: 300px;
        overflow: auto;
        padding-bottom: 0;
        font-size: 15px;
        color: var(--color-d-gray-10);
    }

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        -webkit-appearance: none;
        background-color: var(--text-normal);
        border-radius: 4px;
    }
</style>

<script lang="ts">
    import { ANIME_DATA } from "./ts/types";
    export let metadata: ANIME_DATA;
    let stats: { name: string; value: string }[];
    $: stats = [
        {
            name: "Score",
            value: isNaN(metadata.score)
                ? "N/A"
                : metadata.score.toPrecision(2),
        },
        {
            name: "Popularity",
            value: isNaN(metadata.popularity)
                ? "N/A"
                : "#" + metadata.popularity.toString(),
        },
    ];
</script>

<div class="stat-container">
    {#each stats as stat}
        <span class="stat">
            <span class="stat-name">{stat.name}</span>
            <span class="stat-value">{stat.value}</span>
        </span>
    {/each}
</div>

<style lang="scss">
    .stat-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .stat {
        margin: 5px;
        padding: 5px;
        border: 1px solid var(--color-d-gray-10);
        border-radius: 5px;
        font-size: 0.8em;
        background: transparent;
        color: var(--color-d-gray-10);
    }

    .stat-value {
        font-weight: bold;
        font-size: 1.2em;
        // color: var(--color-d-gray-10);
    }
</style>

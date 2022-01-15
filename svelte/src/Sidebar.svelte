<script lang="ts">
    import _ from "lodash";

    import { onMount } from "svelte";

    import AnimeView from "./AnimeView.svelte";
    import { settings, selected_anime } from "./store";
    import Anime from "../../data-collection/data/min_metadata.json";
    import Slider from "@smui/slider";
    import Autocomplete from "@smui-extra/autocomplete";
    import { ANIME_DATA } from "../../data-collection/types";
    import { nativeTitle } from "./ts/utils";

    const num_anime = _.size(Anime);
    const anime_options = _.values(Anime);
    let sidebar_active = false;

    let popularityThreshold = window.location.hash.length > 0 ? 1 : 0.2;
    let scoreThreshold = 1;
    $: $settings.popularityThreshold =
        Math.pow(popularityThreshold, 2) * num_anime;
    $: $settings.scoreThreshold = Math.pow(scoreThreshold, 2) * num_anime;
    console.log(`Popularity threshold: ${$settings.popularityThreshold}`);

    let username = $settings.username;
    let autocomplete_anime: ANIME_DATA | null = null;
    $: if (autocomplete_anime) {
        $selected_anime = autocomplete_anime;
    }

    function handleSubmit(e: Event) {
        e.preventDefault();
        console.log(username);
        $settings.username = username;
        scoreThreshold = 1;
        popularityThreshold = 1;
        window.location.hash = username;
    }

    function getOptionLabel(option) {
        if (!option) return "";
        if (!option.englishTitle) return option.title;
        if (option.title === option.englishTitle) return option.title;
        if (nativeTitle(option) === option.englishTitle) {
            return `${option.englishTitle} (${option.title})`;
        } else {
            return `${option.title} (${option.englishTitle})`;
        }
    }

    onMount(() => {
        // let input = document.getElementById("mal") as HTMLInputElement;
        // input.addEventListener("keyup", (e) => {
        //     if (e.keyCode === 13) {
        //         // enter
        //         event.preventDefault();
        //         handleSubmit(e);
        //     }
        // });

        let drag_button = document.getElementById("fold-button") as HTMLElement;
        let sidebar = document.getElementById("sidebar") as HTMLElement;
        sidebar.style.transition = "left 0.5s";

        drag_button.addEventListener("pointerup", (e) => {
            if (sidebar_active) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
        selected_anime.subscribe((selected) => {
            if (selected) {
                openSidebar();
            } else {
                closeSidebar();
            }
        });

        function openSidebar() {
            sidebar.style.left = "0px";
            sidebar_active = true;
        }

        function closeSidebar() {
            sidebar.style.left = "-300px";
            sidebar_active = false;
        }
    });
</script>

<aside id="sidebar">
    <div class="sidebarWrapper">
        <button class="fold-button" id="fold-button" on:click={() => 1}>
            {#if sidebar_active}
                <i class="fa fa-chevron-left" />
            {:else}
                <i class="fa fa-chevron-right" />
            {/if}
        </button>

        <div style="text-align: center;">
            <a href="https://github.com/platers/MAL-Map" class="github-link">
                <i class="fa fa-github" style="font-size: 30px;" />
            </a>
        </div>
        <div class="tree-item graph-control-section">
            <div class="tree-item-self">
                <div class="tree-item-children">
                    <Autocomplete
                        options={anime_options}
                        {getOptionLabel}
                        showMenuWithNoInput={false}
                        search={async (input) => {
                            const linput = input.toLowerCase();
                            return anime_options
                                .filter((a) => {
                                    return getOptionLabel(a)
                                        .toLowerCase()
                                        .includes(linput);
                                })
                                .sort((a, b) => {
                                    const aString =
                                        getOptionLabel(a).toLowerCase();
                                    const bString =
                                        getOptionLabel(b).toLowerCase();
                                    if (
                                        aString.startsWith(linput) &&
                                        !bString.startsWith(linput)
                                    ) {
                                        return -1;
                                    } else if (
                                        bString.startsWith(linput) &&
                                        !aString.startsWith(linput)
                                    ) {
                                        return 1;
                                    }
                                    return 0;
                                })
                                .slice(0, 10);
                        }}
                        bind:value={autocomplete_anime}
                        placeholder="Search for an anime"
                        label="Search Anime"
                    />
                    <!-- <div class="setting-item mod-text">
                        <div class="setting-item-control">
                            <div class="text-input-wrapper">
                                <input
                                    class="text-input"
                                    id="mal"
                                    type="text"
                                    placeholder="MyAnimeList Username"
                                    title="Enter your MyAnimeList username and press the search icon"
                                    bind:value={username}
                                />
                                <button
                                    type="submit"
                                    id="submit"
                                    class="text-input-submit-button"
                                    on:click={handleSubmit}
                                >
                                    <i class="fa fa-search" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {#if $settings.username}
                        <div class="setting-item mod-slider">
                            <div class="setting-item-info">
                                Distance to list
                            </div>
                            <div class="setting-item-control">
                                <input
                                    class="slider"
                                    type="range"
                                    min="0"
                                    max="1"
                                    step=".0001"
                                    bind:value={$settings.distance}
                                />
                            </div>
                        </div>
                    {/if}
                    <div class="setting-item mod-slider">
                        <div class="setting-item-info">Score threshold</div>
                        <div class="setting-item-control">
                            <input
                                class="slider"
                                type="range"
                                min="0"
                                max="1"
                                step=".0001"
                                bind:value={scoreThreshold}
                            />
                        </div>
                    </div> 
  
                    <Slider
                        bind:value={popularityThreshold}
                        min={0}
                        max={1}
                        step={0.0001}
                        label="Popularity threshold"
                    />
                    -->
                </div>
            </div>
        </div>
        <AnimeView />
    </div>
</aside>

<style>
    aside {
        position: absolute;
        left: -300px;
        top: 0;
        /* transition: all 0.5s; */
        height: 100%;
        width: 300px;
        background-color: var(--color-d-gray-80);
        opacity: 0.95;
        box-shadow: 0px 0px 4px var(--color-d-shadow-10);
        padding: var(--scale-8-3) var(--scale-8-3) 0 var(--scale-8-3);
        box-sizing: border-box;
        overflow: visible;
    }

    .sidebarWrapper {
        overflow-y: auto;
        height: 100%;
        width: 100%;
        padding-right: 4px;
    }

    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: var(--color-d-gray-20);
        border-radius: 4px;
    }

    .tree-item-self {
        color: var(--color-d-gray-20);
        background: transparent;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 2px 6px 2px 0px;
    }

    .tree-item-inner {
        flex: 1 1 auto;
        /* margin-left: 25px; */
    }

    header {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-normal);
    }

    .tree-item-children {
        margin-top: 8px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--background-modifier-border);
        /* margin-left: 20px; */
        width: 100%;
    }

    .setting-item {
        display: flex;
        align-items: center;
        border-top: 1px solid var(--background-modifier-border);
        padding-top: var(--scale-8-1);
        padding-bottom: var(--scale-8-1);
        margin-right: 0;
    }

    .setting-item:first-child {
        border-top: none;
    }

    .setting-item.mod-slider {
        flex-direction: column;
        width: 100%;
    }

    .setting-item-info {
        flex: 1 1 auto;
        flex-grow: 1;
        width: 100%;
        margin-right: 0;
        font-size: 14px;
        display: inline-block;
        color: var(--color-d-gray-10);
    }

    .setting-item-control {
        flex: 1 1 auto;
        padding-top: 4px;
        width: 100%;
        text-align: right;
        justify-content: flex-end;
        align-items: center;
        /* display: flex; */
    }

    /*────────────────────────────────────
                Slider
────────────────────────────────────*/
    input[type="range"] {
        width: 100%;
        -webkit-appearance: none;
        background-color: transparent;
        height: 24px;
        /* border-radius: 3px; */
    }
    input[type="range"]::-webkit-slider-runnable-track {
        height: 2px;
        background-color: var(--background-modifier-border);
        -webkit-appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        border-radius: 6px;
        width: 24px;
        height: 12px;
        cursor: ew-resize;
        background: var(--color-d-gray-20);
        position: relative;
        top: -6px;
    }

    .text-input {
        width: 100%;
        height: 30px;
        border-radius: 4px;
        outline: none;
        background: var(--color-d-blacker);
        border: 1px solid var(--background-modifier-border);
        font-size: 14px;
        display: block;
        color: var(--text-normal);
    }

    .text-input-wrapper {
        position: relative;
        margin: 0;
    }
    .text-input-submit-button {
        height: var(--scale-8-2);
        width: var(--scale-8-2);
        top: 8px;
        right: 8px;
        color: var(--text-normal);
        cursor: pointer;
        position: absolute;
        background: transparent;
        border: none;
    }

    .fold-button {
        position: absolute;
        top: 50%;
        left: 102%;
        background-color: var(--color-d-gray-20);
        color: var(--color-d-gray-60);
        box-shadow: 0px 0px 4px 1px rgba(0, 0, 0, 0.3);
        border: none;
        height: 40px;
        width: 40px;
        transform: translateX(-50%);
        border-radius: 50%;
        cursor: move;
    }

    .github-link {
        color: var(--color-d-gray-20);
    }
</style>

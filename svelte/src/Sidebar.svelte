<script lang="ts">
    import _ from "lodash";

    import { onMount } from "svelte";

    import AnimeView from "./AnimeView.svelte";
    import Filters from "./Filters.svelte";
    import { settings, selected_anime } from "./store";
    import Anime from "../../data-collection/data/min_metadata.json";
    import Autocomplete from "@smui-extra/autocomplete";
    import { ANIME_DATA } from "../../data-collection/types";
    import { nativeTitle } from "./ts/utils";

    const anime_options = _.values(Anime);
    let sidebar_active = false;

    let autocomplete_anime: ANIME_DATA | null = null;
    $: if (autocomplete_anime) {
        $selected_anime = autocomplete_anime;
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
        <button class="fold-button" id="fold-button">
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
                                const aString = getOptionLabel(a).toLowerCase();
                                const bString = getOptionLabel(b).toLowerCase();
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
                <Filters />
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

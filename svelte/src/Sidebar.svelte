<script lang="ts">
    import _ from "lodash";

    import { onMount } from "svelte";

    import AnimeView from "./AnimeView.svelte";
    import Filters from "./Filters.svelte";
    import { selected_anime } from "./store";
    import Anime from "../../data-collection/data/min_metadata.json";
    import Autocomplete from "@smui-extra/autocomplete";
    import { ANIME_DATA } from "../../data-collection/types";
    import { currentLanguage, nativeTitle, params_dict, updateHashParams } from "./ts/utils";

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
        let open_button = document.getElementById("open-button") as HTMLElement;
        let close_button = document.getElementById("close-button") as HTMLElement;
        let sidebar = document.getElementById("sidebar") as HTMLElement;
        sidebar.style.transition = "left 0.5s";

        open_button.addEventListener("pointerup", (e) => {
            openSidebar();
        });
        close_button.addEventListener("pointerup", (e) => {
            closeSidebar();
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

    function changeLanguage() {
        const newLang = currentLanguage() === "en" ? "ja" : "en";
        params_dict.language = newLang;
        updateHashParams();
        window.location.reload();
    }
</script>


<button class="open-button" id="open-button">
    {#if !sidebar_active}
    <i class="fa fa-bars" />
    {/if}
</button>

<aside id="sidebar">
    <div class="sidebarWrapper">

        <button class="close-button" id="close-button">
            <i class="fa fa-chevron-left" />
        </button>

        <div style="text-align: center;">
            <a href="https://github.com/platers/MAL-Map" class="github-link">
                <i class="fa fa-github" style="font-size: 30px;" />
            </a>
            <button class="lang-button" on:click={e => changeLanguage()}>
                {#if currentLanguage() === "en"}
                    JA
                {:else}
                    EN
                {/if}
            </button>
        </div>
        <div class="tree-item graph-control-section">
            <div class="tree-item-self">
                <div class="search-input">
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
                <i class="fa fa-search search-icon" />
                </div>
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

    .open-button {
        position: absolute;
        top: 25px;
        left: 10px;
        background: transparent;
        border: none;
        color: var(--color-d-white);
        height: 40px;
        width: 40px;
        font-size: 1.5rem;
    }

    .close-button {
        height: 40px;
        width: 40px;
        top: 25px;
        left: 10px;
        font-size: 1.5rem;
        background: transparent;
        border: none;
        color: var(--color-d-white);
        position: absolute;
    }

    .github-link {
        color: var(--color-d-gray-20);
    }

    .lang-button {
        color: var(--color-d-gray-20);
        background: transparent;
        cursor: pointer;
        border: none;
    }

    .search-input {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 20px;
        position: relative;
    }

    .search-icon {
        position: absolute;
        right: -20px;
        margin-top: 10px;
    }
</style>

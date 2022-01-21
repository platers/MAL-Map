<script lang="ts">
    import _ from "lodash";
    import { onMount } from "svelte";
    import { selected_anime } from "./store";

    let sidebar_active = false;

    onMount(() => {
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

        <slot name="top-header" />

        <div class="tree-item graph-control-section">
            <div class="tree-item-self">
                <slot name="searchbar" />
                <slot name="filters" />
            </div>
        </div>
        <slot name="metadata-view" />
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
</style>

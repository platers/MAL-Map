<script lang="ts">
    import Slider from "@smui/slider";
    import { completedList, settings } from "./store";
    import { onMount } from "svelte";
import { queryUser } from "./ts/utils";

    let filters_active = false;
    function clickCollapsible(e: Event) {
        filters_active = !filters_active;
        let target = e.target as HTMLElement;
        let content = target.nextElementSibling as HTMLElement;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }

    let username = $settings.username;
    async function handleSubmit(e: Event) {
        e.preventDefault();
        console.log(username);
        $settings.username = username;
        if (username === "") {
            $completedList = [];
            return;
        }

        const list = await queryUser(username);
        if (list === null) {
            alert("User not found or server error, please try again."); // TODO: prettier error handling
        } else {
            $completedList = list;
        }
        $settings.distance = $settings.distance; // force update
    }

    onMount(() => {
        let input = document.getElementById("mal") as HTMLInputElement;
        input.addEventListener("keyup", (e) => {
            if (e.keyCode === 13) {
                // enter
                event.preventDefault();
                handleSubmit(e);
            }
        });
    });
</script>

<button class="collapsible" on:click={(e) => clickCollapsible(e)}>
    {#if filters_active}
        <i class="fa fa-caret-down fa-caret" />
    {:else}
        <i class="fa fa-caret-right fa-caret" />
    {/if}
    Filters
</button>
<div class="tree-item-children">
    <div class="setting-item mod-text">
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

    <div class="setting-item mod-slider">
        <div class="setting-item-info">Distance to user watched list: {$settings.distance}</div>
        <Slider
            bind:value={$settings.distance}
            min={0}
            max={1}
            step={0.01}
            label="Distance to user list"
        />
    </div>

    <div class="setting-item mod-slider">
        <div class="setting-item-info">
            Score threshold: {$settings.scoreThreshold}
        </div>
        <Slider
            bind:value={$settings.scoreThreshold}
            min={0}
            max={10}
            step={0.01}
            label="Popularity threshold"
        />
    </div>
    <div class="setting-item mod-slider">
        <div class="setting-item-info">
            Year: {$settings.startYear} - {$settings.endYear}
        </div>
        <Slider
            range
            bind:start={$settings.startYear}
            bind:end={$settings.endYear}
            min={1960}
            max={2026}
            step={1}
            label="Year range"
        />
    </div>
</div>

<style>
    .collapsible {
        cursor: pointer;
        padding: 0;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        outline: none;
        font-size: 15px;
        color: var(--color-d-gray-20);
    }

    .fa-caret {
        margin-right: 5px;
        width: 10px;
    }
    .tree-item-children {
        margin-top: 8px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--background-modifier-border);
        /* margin-left: 20px; */
        width: 100%;

        max-height: 0;
        overflow: hidden;
        transition: max-height 0.2s ease-out;
    }

    .setting-item {
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
</style>

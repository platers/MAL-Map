<script lang="ts">
    import { onMount } from "svelte";
    let input: string;
    export let placeholder: string;
    export let title: string;

    export let handleSubmit: (event: Event, input: string) => void;


    onMount(() => {
        let el = document.getElementById(title) as HTMLInputElement;
        el.addEventListener("keyup", (e) => {
            if (e.keyCode === 13) {
                // enter
                event.preventDefault();
                handleSubmit(e, input);
            }
        });
    });
</script>

<div class="setting-item mod-text">
    <div class="setting-item-control">
        <div class="text-input-wrapper">
            <input
                class="text-input"
                id={title}
                type="text"
                {placeholder}
                {title}
                bind:value={input}
            />
            <button
                type="submit"
                id="submit"
                class="text-input-submit-button"
                on:click={(e) => handleSubmit(e, input)}
            >
                <i class="fa fa-search" />
            </button>
        </div>
    </div>
</div>

<style>
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

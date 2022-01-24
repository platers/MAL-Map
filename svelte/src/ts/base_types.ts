export class METADATA {
    id: number;
    title: string;
    display_title?: string;
    picture?: string;
    members: number;

    canonicalTitle() {
        return this.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

};
export type METADATA_DICT = { [id: number]: METADATA; };
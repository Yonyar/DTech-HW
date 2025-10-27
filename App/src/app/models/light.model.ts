export class Light {
    id: string;
    room: string;
    name: string;
    data: {
        state: boolean;
        color: string;
        brightness: number;
        savedColors: Array<string>;
        options: {
            rgb: boolean;
            transit: boolean;
            connected: false;
            colorRemovable: boolean;
            colorResetable: boolean;
            expanded: boolean;
        }
    }
}
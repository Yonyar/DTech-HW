export class Switch {
    id: number;
    //room: string;
    name: string;
    data: {
        lightLinks: Array<string>;
        options: {
            connected: boolean;
        }
    }
}
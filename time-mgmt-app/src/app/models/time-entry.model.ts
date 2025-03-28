export enum EntryType {
    START = 'START',
    BREAK_START = 'BREAK_START',
    BREAK_END = 'BREAK_END',
    FINISH = 'FINISH'
}

export class TimeEntry {
    constructor(
        public type: EntryType,
        public timestamp: Date = new Date(),
        public isManuallyEntered: boolean = false
    ) {}
}

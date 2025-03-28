import { TimeEntry, EntryType } from './time-entry.model';

export class WorkDay {
    public hasError: boolean = false;
    public totalHours: number = 0;

    constructor(
        public date: Date = new Date(),
        public entries: TimeEntry[] = []
    ) {
        this.validateEntries();
        this.calculateTotalHours();
    }

    public calculateTotalHours(): void {
        let totalMilliseconds = 0;
        let startTime: Date | null = null;
        let breakStartTime: Date | null = null;
        let breakTotalMilliseconds = 0;

        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            
            if (entry.type === EntryType.START) {
                startTime = entry.timestamp;
            } else if (entry.type === EntryType.BREAK_START) {
                breakStartTime = entry.timestamp;
            } else if (entry.type === EntryType.BREAK_END && breakStartTime) {
                breakTotalMilliseconds += entry.timestamp.getTime() - breakStartTime.getTime();
                breakStartTime = null;
            } else if (entry.type === EntryType.FINISH && startTime) {
                totalMilliseconds = entry.timestamp.getTime() - startTime.getTime() - breakTotalMilliseconds;
            }
        }

        this.totalHours = totalMilliseconds / (1000 * 60 * 60);
    }

    public validateEntries(): void {
        // Check if day is not finished
        if (this.entries.length === 0) {
            this.hasError = false;
            return;
        }

        const lastEntry = this.entries[this.entries.length - 1];
        if (lastEntry.type !== EntryType.FINISH) {
            this.hasError = true;
            return;
        }

        // Check for proper sequence (START -> [BREAK_START -> BREAK_END]* -> FINISH)
        let expectedType = EntryType.START;
        for (const entry of this.entries) {
            if (expectedType === EntryType.START && entry.type === EntryType.START) {
                expectedType = EntryType.BREAK_START;
            } else if (expectedType === EntryType.BREAK_START && 
                      (entry.type === EntryType.BREAK_START || entry.type === EntryType.FINISH)) {
                expectedType = entry.type === EntryType.BREAK_START ? EntryType.BREAK_END : EntryType.START;
            } else if (expectedType === EntryType.BREAK_END && entry.type === EntryType.BREAK_END) {
                expectedType = EntryType.BREAK_START;
            } else if (entry.type !== expectedType) {
                this.hasError = true;
                return;
            }
        }

        this.hasError = false;
    }
}

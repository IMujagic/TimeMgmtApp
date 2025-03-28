import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WorkDay } from '../models/work-day.model';
import { TimeEntry, EntryType } from '../models/time-entry.model';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class TimeTrackingService {
    private currentDaySubject: BehaviorSubject<WorkDay>;
    private allDaysSubject: BehaviorSubject<WorkDay[]>;
    
    constructor(private storageService: StorageService) {
        // Initialize with data from storage
        const today = this.storageService.getTodayWorkDay();
        const allDays = this.storageService.getWorkDays();
        
        this.currentDaySubject = new BehaviorSubject<WorkDay>(today);
        this.allDaysSubject = new BehaviorSubject<WorkDay[]>(allDays);
    }
    
    /**
     * Get the current day as an observable
     */
    public getCurrentDay(): Observable<WorkDay> {
        return this.currentDaySubject.asObservable();
    }
    
    /**
     * Get all work days as an observable
     */
    public getAllDays(): Observable<WorkDay[]> {
        return this.allDaysSubject.asObservable();
    }
    
    /**
     * Get the next available action based on the current state
     */
    public getNextAction(): EntryType | null {
        const currentDay = this.currentDaySubject.value;
        
        if (currentDay.entries.length === 0) {
            return EntryType.START;
        }
        
        const lastEntry = currentDay.entries[currentDay.entries.length - 1];
        
    switch (lastEntry.type) {
        case EntryType.START:
            return EntryType.BREAK_START;
        case EntryType.BREAK_START:
            return EntryType.BREAK_END;
        case EntryType.BREAK_END:
            return EntryType.FINISH; // After a break, we can finish work
        case EntryType.FINISH:
            return null; // Day is finished
        default:
            return EntryType.START;
    }
    }
    
    /**
     * Add a time entry to the current day
     */
    public addTimeEntry(type: EntryType, timestamp: Date = new Date(), isManual: boolean = false): void {
        const currentDay = this.currentDaySubject.value;
        const entry = new TimeEntry(type, timestamp, isManual);
        
        currentDay.entries.push(entry);
        currentDay.validateEntries();
        currentDay.calculateTotalHours();
        
        // Save to storage
        this.storageService.saveWorkDay(currentDay);
        
        // Update observables
        this.currentDaySubject.next(currentDay);
        this.refreshAllDays();
    }
    
    /**
     * Manually finish a day that was not properly closed
     */
    public manuallyFinishDay(day: WorkDay, finishTime: Date): void {
        // Add FINISH entry
        day.entries.push(new TimeEntry(EntryType.FINISH, finishTime, true));
        day.validateEntries();
        day.calculateTotalHours();
        
        // Save to storage
        this.storageService.saveWorkDay(day);
        
        // Update observables
        if (day.date.toDateString() === this.currentDaySubject.value.date.toDateString()) {
            this.currentDaySubject.next(day);
        }
        
        this.refreshAllDays();
    }
    
    /**
     * Add a break to a day that was not properly tracked
     */
    public manuallyAddBreak(day: WorkDay, breakStart: Date, breakEnd: Date): void {
        // Find where to insert the break entries (before FINISH if exists)
        const finishIndex = day.entries.findIndex(e => e.type === EntryType.FINISH);
        
        const breakStartEntry = new TimeEntry(EntryType.BREAK_START, breakStart, true);
        const breakEndEntry = new TimeEntry(EntryType.BREAK_END, breakEnd, true);
        
        if (finishIndex >= 0) {
            // Insert before FINISH
            day.entries.splice(finishIndex, 0, breakStartEntry, breakEndEntry);
        } else {
            // No FINISH entry, just append
            day.entries.push(breakStartEntry, breakEndEntry);
        }
        
        day.validateEntries();
        day.calculateTotalHours();
        
        // Save to storage
        this.storageService.saveWorkDay(day);
        
        // Update observables
        if (day.date.toDateString() === this.currentDaySubject.value.date.toDateString()) {
            this.currentDaySubject.next(day);
        }
        
        this.refreshAllDays();
    }
    
    /**
     * Edit an existing day
     */
    public updateWorkDay(day: WorkDay): void {
        day.validateEntries();
        day.calculateTotalHours();
        
        // Save to storage
        this.storageService.saveWorkDay(day);
        
        // Update observables
        if (day.date.toDateString() === this.currentDaySubject.value.date.toDateString()) {
            this.currentDaySubject.next(day);
        }
        
        this.refreshAllDays();
    }
    
    /**
     * Refresh the list of all days
     */
    private refreshAllDays(): void {
        const allDays = this.storageService.getWorkDays();
        this.allDaysSubject.next(allDays);
    }
}

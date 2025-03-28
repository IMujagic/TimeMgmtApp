import { Injectable } from '@angular/core';
import { WorkDay } from '../models/work-day.model';
import { TimeEntry, EntryType } from '../models/time-entry.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly STORAGE_KEY = 'time-mgmt-app-data';
    
    constructor() { }
    
    /**
     * Save work days to local storage
     */
    public saveWorkDays(workDays: WorkDay[]): void {
        const serializedData = JSON.stringify(workDays, (key, value) => {
            // Convert Date objects to ISO strings for serialization
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        });
        
        localStorage.setItem(this.STORAGE_KEY, serializedData);
    }
    
    /**
     * Get work days from local storage
     */
    public getWorkDays(): WorkDay[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        
        if (!data) {
            return [];
        }
        
        try {
            // Parse the JSON data and convert ISO date strings back to Date objects
            const parsedData = JSON.parse(data, (key, value) => {
                // Check if the value is a date string
                if (typeof value === 'string' && 
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
                    return new Date(value);
                }
                return value;
            });
            
            // Convert plain objects to WorkDay and TimeEntry instances
            return parsedData.map((day: any) => {
                const entries = day.entries.map((entry: any) => 
                    new TimeEntry(entry.type, new Date(entry.timestamp), entry.isManuallyEntered)
                );
                
                return new WorkDay(new Date(day.date), entries);
            });
        } catch (error) {
            console.error('Error parsing stored data:', error);
            return [];
        }
    }
    
    /**
     * Add or update a work day
     */
    public saveWorkDay(workDay: WorkDay): void {
        const workDays = this.getWorkDays();
        
        // Find if the day already exists (by date)
        const existingIndex = workDays.findIndex(day => 
            day.date.toDateString() === workDay.date.toDateString()
        );
        
        if (existingIndex >= 0) {
            // Update existing day
            workDays[existingIndex] = workDay;
        } else {
            // Add new day
            workDays.push(workDay);
        }
        
        this.saveWorkDays(workDays);
    }
    
    /**
     * Get a work day by date
     */
    public getWorkDay(date: Date): WorkDay | null {
        const workDays = this.getWorkDays();
        const found = workDays.find(day => 
            day.date.toDateString() === date.toDateString()
        );
        
        return found || null;
    }
    
    /**
     * Get today's work day or create a new one
     */
    public getTodayWorkDay(): WorkDay {
        const today = new Date();
        const existingDay = this.getWorkDay(today);
        
        if (existingDay) {
            return existingDay;
        }
        
        // Create a new day for today
        return new WorkDay(today, []);
    }
}

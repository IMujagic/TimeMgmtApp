import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { WorkDay } from '../../models/work-day.model';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-details-page',
    templateUrl: './details-page.component.html',
    styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent implements OnInit, OnDestroy {
    public workDays: WorkDay[] = [];
    public selectedDay: WorkDay | null = null;
    public showErrorModal = false;
    
    // For manual time entry
    public manualFinishTime: Date = new Date();
    public manualBreakStart: Date = new Date();
    public manualBreakEnd: Date = new Date();
    
    private subscriptions: Subscription[] = [];
    
    constructor(
        private timeTrackingService: TimeTrackingService,
        private translationService: TranslationService,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        // Subscribe to all days
        this.subscriptions.push(
            this.timeTrackingService.getAllDays().subscribe(days => {
                this.workDays = days.sort((a, b) => 
                    b.date.getTime() - a.date.getTime()
                );
            })
        );
    }
    
    ngOnDestroy(): void {
        // Clean up subscriptions
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    /**
     * Navigate back to landing page
     */
    public goBack(): void {
        this.router.navigate(['/']);
    }
    
    /**
     * Open error correction modal for a day
     */
    public openErrorModal(day: WorkDay): void {
        this.selectedDay = day;
        
        // Initialize with reasonable default times
        const now = new Date();
        
        // For finish time, use 8 hours after the first START entry
        if (day.entries.length > 0 && day.entries[0].timestamp) {
            const startTime = day.entries[0].timestamp;
            this.manualFinishTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000);
        } else {
            this.manualFinishTime = now;
        }
        
        // For break times, use noon as a reasonable default
        const noon = new Date(now);
        noon.setHours(12, 0, 0, 0);
        this.manualBreakStart = new Date(noon);
        
        // Break end 1 hour after break start
        this.manualBreakEnd = new Date(noon.getTime() + 60 * 60 * 1000);
        
        this.showErrorModal = true;
    }
    
    /**
     * Close error correction modal
     */
    public closeErrorModal(): void {
        this.showErrorModal = false;
        this.selectedDay = null;
    }
    
    /**
     * Save manual finish time
     */
    public saveManualFinish(): void {
        if (this.selectedDay) {
            this.timeTrackingService.manuallyFinishDay(this.selectedDay, this.manualFinishTime);
            this.closeErrorModal();
        }
    }
    
    /**
     * Save manual break
     */
    public saveManualBreak(): void {
        if (this.selectedDay) {
            this.timeTrackingService.manuallyAddBreak(
                this.selectedDay, 
                this.manualBreakStart, 
                this.manualBreakEnd
            );
            this.closeErrorModal();
        }
    }
    
    /**
     * Format hours for display
     */
    public formatHours(hours: number): string {
        return hours.toFixed(2);
    }
    
    /**
     * Format date for display
     */
    public formatDate(date: Date): string {
        return date.toLocaleDateString();
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { TimeTrackingService } from '../../services/time-tracking.service';
import { WorkDay } from '../../models/work-day.model';
import { EntryType } from '../../models/time-entry.model';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
    public currentDate: Date = new Date();
    public currentDay: WorkDay | null = null;
    public nextAction: EntryType | null = null;
    public EntryType = EntryType; // Make enum available in template
    
    private subscriptions: Subscription[] = [];
    private clockInterval: Subscription | null = null;
    
    constructor(
        private timeTrackingService: TimeTrackingService,
        private translationService: TranslationService,
        private router: Router
    ) {}
    
    ngOnInit(): void {
        // Update clock every second
        this.clockInterval = interval(1000).subscribe(() => {
            this.currentDate = new Date();
        });
        
        // Subscribe to current day changes
        this.subscriptions.push(
            this.timeTrackingService.getCurrentDay().subscribe(day => {
                this.currentDay = day;
                this.nextAction = this.timeTrackingService.getNextAction();
            })
        );
    }
    
    ngOnDestroy(): void {
        // Clean up subscriptions
        if (this.clockInterval) {
            this.clockInterval.unsubscribe();
        }
        
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    /**
     * Perform the next action (START, BREAK_START, BREAK_END, FINISH)
     */
    public performAction(action: EntryType): void {
        this.timeTrackingService.addTimeEntry(action);
    }
    
    /**
     * Navigate to details page
     */
    public viewDetails(): void {
        this.router.navigate(['/details']);
    }
    
    /**
     * Format hours for display
     */
    public formatHours(hours: number): string {
        return hours.toFixed(2);
    }
}

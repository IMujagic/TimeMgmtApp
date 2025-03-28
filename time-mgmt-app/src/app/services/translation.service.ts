import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'en';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    private translations: { [key: string]: { [key: string]: string } } = {};
    private currentLangSubject = new BehaviorSubject<Language>('en');
    
    constructor() {
        this.loadTranslations('en');
    }
    
    /**
     * Get the current language
     */
    public getCurrentLanguage(): Observable<Language> {
        return this.currentLangSubject.asObservable();
    }
    
    /**
     * Set the current language
     */
    public setLanguage(lang: Language): void {
        this.loadTranslations(lang);
        this.currentLangSubject.next(lang);
    }
    
    /**
     * Translate a key
     */
    public translate(key: string, params: { [key: string]: string | number } = {}): string {
        const lang = this.currentLangSubject.value;
        
        if (!this.translations[lang] || !this.translations[lang][key]) {
            console.warn(`Translation missing for key: ${key} in language: ${lang}`);
            return key;
        }
        
        let translation = this.translations[lang][key];
        
        // Replace parameters
        Object.keys(params).forEach(param => {
            const regex = new RegExp(`{{${param}}}`, 'g');
            translation = translation.replace(regex, String(params[param]));
        });
        
        return translation;
    }
    
    /**
     * Load translations for a language
     */
    private loadTranslations(lang: Language): void {
        switch (lang) {
            case 'en':
                this.translations['en'] = {
                    // Common
                    'app.title': 'Time Management App',
                    'app.loading': 'Loading...',
                    'app.save': 'Save',
                    'app.cancel': 'Cancel',
                    'app.edit': 'Edit',
                    'app.delete': 'Delete',
                    'app.close': 'Close',
                    
                    // Landing page
                    'landing.current_date': 'Current Date',
                    'landing.current_time': 'Current Time',
                    'landing.start_work': 'START WORK',
                    'landing.start_break': 'START BREAK',
                    'landing.end_break': 'END BREAK',
                    'landing.finish_work': 'FINISH WORK',
                    'landing.day_finished': 'Work day finished',
                    'landing.total_hours': 'Total hours today: {{hours}}',
                    'landing.view_details': 'View Details',
                    
                    // Details page
                    'details.title': 'Work Days',
                    'details.date': 'Date',
                    'details.hours': 'Hours',
                    'details.status': 'Status',
                    'details.actions': 'Actions',
                    'details.error': 'Error',
                    'details.completed': 'Completed',
                    'details.no_data': 'No work days recorded yet',
                    'details.back': 'Back to Today',
                    
                    // Error correction
                    'error.title': 'Fix Time Entry',
                    'error.finish_time': 'Finish Time',
                    'error.break_start': 'Break Start',
                    'error.break_end': 'Break End',
                    'error.add_break': 'Add Break',
                    'error.fix_day': 'Fix Day',
                };
                break;
            default:
                console.error(`Unsupported language: ${lang}`);
        }
    }
}

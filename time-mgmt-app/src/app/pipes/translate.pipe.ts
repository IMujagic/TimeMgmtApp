import { Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
    name: 'translate',
    pure: false
})
export class TranslatePipe implements PipeTransform {
    constructor(private translationService: TranslationService) {}
    
    transform(key: string, params: { [key: string]: string | number } = {}): string {
        return this.translationService.translate(key, params);
    }
}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';
import { TranslatePipe } from './pipes/translate.pipe';

@NgModule({
    declarations: [
        AppComponent,
        LandingPageComponent,
        DetailsPageComponent,
        TranslatePipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

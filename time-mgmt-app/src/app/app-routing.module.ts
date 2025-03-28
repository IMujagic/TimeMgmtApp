import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';

const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'details', component: DetailsPageComponent },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

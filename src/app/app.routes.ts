import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FeedComponent } from './feed/feed.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'feed', component: FeedComponent },
    { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
    { path: '**', redirectTo: 'login' }
];

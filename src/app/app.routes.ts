import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { FeedComponent } from './components/feed/feed.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
    { path: 'feed', component: FeedComponent },
    { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent) },
    { path: 'chat/:id', loadComponent: () => import('./components/conversation/conversation.component').then(m => m.ConversationComponent) },
    { path: 'profile/:id', loadComponent: () => import('./components/profile-details/profile-details.component').then(m => m.ProfileDetailsComponent) },
    { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },
    { path: '**', redirectTo: 'login' }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { FeedComponent } from './components/feed/feed.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [loginGuard] },
    { path: 'feed', component: FeedComponent, canActivate: [authGuard] },
    { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
    { path: 'chat/:id', loadComponent: () => import('./components/conversation/conversation.component').then(m => m.ConversationComponent), canActivate: [authGuard] },
    { path: 'profile/:id', loadComponent: () => import('./components/profile-details/profile-details.component').then(m => m.ProfileDetailsComponent), canActivate: [authGuard] },
    { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: 'feed' }
];

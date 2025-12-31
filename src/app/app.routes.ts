import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { FeedComponent } from './components/feed/feed.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { plansGuard } from './core/guards/plans.guard';
import { adminGuard } from './core/guards/admin.guard';

import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
// Note: Assuming AccessGuard is provided in root or exported from appropriate file. 
// Just in case, import it.
import { AccessGuard } from './core/guards/access.guard';
import { ManualNavigationGuard } from './core/guards/manual-navigation.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
    { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent), canActivate: [loginGuard] },
    { path: 'coming-soon', component: ComingSoonComponent },
    { path: 'feed', component: FeedComponent, canActivate: [authGuard, AccessGuard, ManualNavigationGuard] }, // AccessGuard added
    { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard, ManualNavigationGuard] },
    { path: 'chat/:id', loadComponent: () => import('./components/conversation/conversation.component').then(m => m.ConversationComponent), canActivate: [authGuard, ManualNavigationGuard] },
    { path: 'admin', loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [adminGuard] },
    { path: 'admin/users', loadComponent: () => import('./components/admin/users/admin-users.component').then(m => m.AdminUsersComponent), canActivate: [adminGuard] },
    { path: 'admin/reports', loadComponent: () => import('./components/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent), canActivate: [adminGuard] },
    { path: 'profile/edit', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'profile', loadComponent: () => import('./components/profile/profile-view/profile-view.component').then(m => m.ProfileViewComponent), canActivate: [authGuard], pathMatch: 'full' },
    { path: 'profile/:id', loadComponent: () => import('./components/profile-details/profile-details.component').then(m => m.ProfileDetailsComponent), canActivate: [authGuard] },
    { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent), canActivate: [authGuard] },
    { path: 'plans', loadComponent: () => import('./components/plans/plans.component').then(m => m.PlansComponent), canActivate: [authGuard, plansGuard, ManualNavigationGuard] },
    { path: '**', redirectTo: 'feed' }
];

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ManualNavigationGuard implements CanActivate {
    private authService = inject(AuthService);
    private router = inject(Router);

    canActivate(): boolean | UrlTree {
        // 1. Admins are exempt
        if (this.authService.isAdmin()) {
            return true;
        }

        // 2. Check if this is a Deep Link / Refresh (Initial Navigation)
        // If router hasn't navigated yet, it means the user is LANDING on this page directly.
        // We want to force them to start at a safe page (Profile/Home) if they are Common Users.
        if (!this.router.navigated) {
            return this.router.parseUrl('/profile');
        }

        // 3. Check Navigation Trigger
        const currentNav = this.router.getCurrentNavigation();

        // 'imperative' = Router.navigate / routerLink
        // 'popstate' = Browser Back/Forward

        if (currentNav && currentNav.trigger === 'imperative') {
            return true;
        }

        // 4. Block everything else (Popstate, etc)
        // Redirect to a safe page (Profile or Home)
        return this.router.parseUrl('/profile');
    }
}

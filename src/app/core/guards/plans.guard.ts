import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NavigationStateService } from '../services/navigation-state.service';

export const plansGuard: CanActivateFn = (route, state) => {
    const navService = inject(NavigationStateService);
    const router = inject(Router);

    if (navService.isPlansAccessAllowed()) {
        // Optional: Clear access immediately if you want it to be single-use, 
        // but usually better to clear on component destroy or nav end.
        // For now, let's keep it open until they leave the view? 
        // Actually, if they refresh, the service state is lost anyway (which is good).
        return true;
    }

    // Redirect to home/feed if unauthorized access attempt
    return router.createUrlTree(['/feed']);
};

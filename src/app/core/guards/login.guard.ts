import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

export const loginGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.checkAuth().pipe(
        take(1),
        map(isAuthenticated => {
            if (isAuthenticated) {
                return router.createUrlTree(['/profile']);
            } else {
                return true;
            }
        })
    );
};

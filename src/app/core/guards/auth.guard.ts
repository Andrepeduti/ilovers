import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.checkAuth().pipe(
        map(isAuthenticated => {
            if (isAuthenticated) {
                return true;
            } else {
                return router.createUrlTree(['/login']);
            }
        })
    );
};

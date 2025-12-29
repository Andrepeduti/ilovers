import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
        router.navigate(['/login']);
        return false;
    }

    const token = authService.getToken();
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            // Check for role claim. Might be case sensitive or mapped differently.
            // .NET typically sends "role" or "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            const role = decoded['role'] || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (role === 'Admin') {
                return true;
            }
        } catch (e) {
            console.error('Error decoding token', e);
        }
    }

    // Not admin or error
    router.navigate(['/feed']);
    return false;
};

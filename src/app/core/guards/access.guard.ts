import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AccessService } from '../services/access.service';

@Injectable({
    providedIn: 'root'
})
export class AccessGuard implements CanActivate {
    constructor(private accessService: AccessService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.accessService.checkLaunchStatus().pipe(
            map(status => {
                if (status.canAccess) {
                    return true;
                } else {
                    // Redirect to coming soon page
                    return this.router.parseUrl('/coming-soon');
                }
            })
        );
    }
}

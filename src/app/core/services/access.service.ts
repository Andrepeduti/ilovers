import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LaunchStatus {
    canAccess: boolean;
    releaseDate: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccessService {
    private apiUrl = `${environment.apiUrl}/config`;
    private launchStatus: LaunchStatus | null = null;

    constructor(private http: HttpClient) { }

    checkLaunchStatus(): Observable<LaunchStatus> {
        return this.http.get<{ data: LaunchStatus }>(`${this.apiUrl}/launch-status`).pipe(
            tap(response => {
                if (response && response.data) {
                    this.launchStatus = response.data;
                }
            }),
            map(response => response.data),
            catchError(() => {
                // Fail Closed logic on Frontend too
                return of({ canAccess: false, releaseDate: '', message: 'Erro de conexão ou acesso negado.' });
            })
        );
    }

    getCachedStatus(): LaunchStatus | null {
        return this.launchStatus;
    }
}

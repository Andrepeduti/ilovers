import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaths } from '../enums/api-paths.enum';
import { AuthResponse } from '../models/user.interface';
// import { MOCK_AUTH_RESPONSE } from '../mocks/auth.mock';
import { delay, tap, map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // Signal to store user profile data
    public currentUser = signal<any>(null);
    public currentCoverPhoto = signal<string | null>(null);

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}${ApiPaths.LOGIN}`, credentials).pipe(
            tap(response => {
                if (response.data && response.data.accessToken) {
                    localStorage.setItem('access_token', response.data.accessToken);
                }
            })
        );
    }

    register(data: any): Observable<any> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}${ApiPaths.REGISTER}`, data).pipe(
            tap(response => {
                if (response.data && response.data.accessToken) {
                    localStorage.setItem('access_token', response.data.accessToken);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        this.currentUser.set(null);
    }

    // New method to check if session is valid ("Am I logged in?")
    checkAuth(): Observable<boolean> {
        const token = localStorage.getItem('access_token');
        if (!token) return of(false);

        return of(true);
    }

    // Synchronous check for guards
    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    isLoggedIn(): boolean {
        return this.isAuthenticated();
    }
    // Update user profile
    // Get user profile
    getProfile(): Observable<any> {
        return this.http.get(`${environment.apiUrl}${ApiPaths.PROFILE}`).pipe(
            tap((response: any) => {
                console.log('AuthService: getProfile loaded', response);
                if (response && response.data) {
                    this.currentUser.set(response.data);

                    // Populate cover photo signal globally
                    const imgs = response.data.images || response.data.photos;
                    if (imgs && imgs.length > 0) {
                        this.currentCoverPhoto.set(imgs[0]);
                    }
                }
            })
        );
    }

    // Update user profile
    updateProfile(data: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}${ApiPaths.PROFILE}`, data).pipe(
            tap(() => {
                const current = this.currentUser();
                this.currentUser.set({ ...current, ...data });
            })
        );
    }
    isProfileComplete(profile: any): boolean {
        if (!profile) return false;
        return profile.isComplete === true;
    }

    getToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getUserId(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.sub || decoded.nameid || null;
        } catch (e) {
            console.error('Failed to decode token', e);
            return null;
        }
    }
}

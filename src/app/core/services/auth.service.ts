import { Injectable, signal, inject } from '@angular/core'; // Added inject
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaths } from '../enums/api-paths.enum';
import { AuthResponse } from '../models/user.interface';
import { FeedService } from './feed.service'; // Added FeedService import
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

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            tap(response => {
                if (response && response.data && response.data.accessToken) {
                    localStorage.setItem('access_token', response.data.accessToken);
                }
            })
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
    }

    resetPassword(data: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/reset-password`, data);
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

    private feedService = inject(FeedService);

    logout() {
        localStorage.removeItem('access_token');
        this.currentUser.set(null);
        this.feedService.clearState();
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

    getUserRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            // Common claim names for role
            return decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
        } catch (e) {
            return null;
        }
    }

    isAdmin(): boolean {
        const role = this.getUserRole();
        return role === 'Admin';
    }
}

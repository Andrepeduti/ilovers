import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';

export interface DashboardMetrics {
    users: {
        total: number;
        active: number;
        incomplete: number;
    };
    engagement: {
        likes: number;
        superLikes: number;
        rewinds: number;
        rejections: number;
        matches: number;
        chats: number;
        messages: number;
    };
    subscriptions: {
        totalPremiumUsers: number;
        totalFreeUsers: number;
    };
    moderation: {
        pendingReports: number;
        resolvedReports: number;
    };
}

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getDashboardMetrics(): Observable<DashboardMetrics> {
        return this.http.get<{ data: DashboardMetrics }>(`${this.apiUrl}/dashboard`)
            .pipe(map(res => res.data));
    }

    getUsers(): Observable<AdminUser[]> {
        return this.http.get<{ data: AdminUser[] }>(`${this.apiUrl}/users`)
            .pipe(map(res => res.data));
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
    }
}

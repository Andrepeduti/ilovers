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
export interface UserListResponse {
    items: AdminUser[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface Report {
    id: string;
    reporterEmail: string;
    reportedEmail: string;
    reason: string;
    comment?: string;
    evidenceUrls: string[];
    status: string;
    createdAt: string;
}

export interface ReportListResponse {
    items: Report[];
    totalCount: number;
    page: number;
    pageSize: number;
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

    getUsers(page = 1, pageSize = 20, search = ''): Observable<UserListResponse> {
        let params: any = { page, pageSize };
        if (search) params.search = search;

        return this.http.get<{ data: UserListResponse }>(`${this.apiUrl}/users`, { params })
            .pipe(map(res => res.data));
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
    }

    getReports(page = 1, pageSize = 20): Observable<ReportListResponse> {
        return this.http.get<{ data: ReportListResponse }>(`${this.apiUrl}/reports`, { params: { page, pageSize } })
            .pipe(map(res => res.data));
    }

    updateReportStatus(reportId: string, status: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/reports/${reportId}/status`, { status });
    }
}

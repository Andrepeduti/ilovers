import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/reports`;

    reportUser(data: { reportedUserId: string; reason: string; comment?: string; evidenceUrls?: string[] }) {
        return this.http.post(this.apiUrl, data);
    }
}

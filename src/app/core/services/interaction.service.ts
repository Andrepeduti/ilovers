import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InteractionService {
    private apiUrl = `${environment.apiUrl}/api/v1/interactions`;

    constructor(private http: HttpClient) { }

    getPendingNotifications(): Observable<any> {
        return this.http.get(`${this.apiUrl}/notifications`);
    }

    markAsViewed(interactionId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/${interactionId}/viewed`, {});
    }
}

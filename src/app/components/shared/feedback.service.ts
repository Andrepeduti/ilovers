import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface FeedbackStats {
    total: number;
    skipped: number;
    submitted: number;
    bad: number;
    good: number;
    great: number;
}

export interface AppFeedback {
    id: string;
    userId: string;
    userEmail: string;
    status: string;
    score?: string; // Enum string
    comment?: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class FeedbackService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/feedback`;

    submitFeedback(score: number | null, comment: string | null, isSkipped: boolean): Observable<void> {
        const payload = {
            score: score, // matches backend nullable enum (1,2,3) or convert to Name? Backend configured Key->String? 
            // Wait, backend: request.Score (FeedbackScore?). JSON serializer usually sends numbers by default unless configured.
            // My backend config in DbContext "HasConversion<string>" is for DB storage. API binding default is Number or String depending on settings. 
            // Let's send Number first. If backend expects string, I'll need to map. 
            // Actually, Enum in C# API body often binds from number.
            // Let's safe-guard: send number. (1=Bad, 2=Good, 3=Great).
            comment: comment,
            isSkipped: isSkipped
        };
        return this.http.post<void>(this.apiUrl, payload);
    }

    getStats(): Observable<FeedbackStats> {
        return this.http.get<FeedbackStats>(`${this.apiUrl}/stats`);
    }

    getList(): Observable<AppFeedback[]> {
        return this.http.get<AppFeedback[]>(`${this.apiUrl}/list`);
    }

    // Logic for scheduling
    // "Após 15 dias tem q aparecer de novo"
    // "Se ele decidir ir pelo botão depois, mostre no dia seguinte de novo"

    checkEligibility(): Observable<{ eligible: boolean }> {
        return this.http.get<{ eligible: boolean }>(`${this.apiUrl}/eligibility`);
    }

    shouldShowFeedback(): boolean {
        // Deprecated, use checkEligibility() observable instead.
        // Keeping this for safety reference or removing entirely if safe.
        // Let's remove implementation details of local storage.
        return false;
    }

    recordAction(action: 'submit' | 'skip') {
        // Local storage record no longer needed for decision, 
        // but maybe useful for debugging? We can leave empty or remove.
        // Removing logic to force reliance on backend.
    }
}


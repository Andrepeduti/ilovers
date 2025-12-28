import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
    data: T;
    meta: any;
    isSuccess: boolean;
    isFailure: boolean;
    error: any;
}

export interface Plan {
    code: string;
    name: string;
    price: number;
    durationDays: number;
}

export interface PaymentResponse {
    status: string;
    statusDetail: string;
    paymentId: number;
    qrCode?: string;
    qrCodeBase64?: string;
}

export interface ProcessPaymentRequest {
    planCode: string;
    token?: string;
    paymentMethodId: string;
    issuerId?: string;
    payerEmail: string;
    identificationType: string;
    identificationNumber: string;
    amount: number; // For bricks, but usually handled by backend plan. We'll pass it for consistency if needed or just backend.
    description: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlanService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;

    getPlans(): Observable<Plan[]> {
        return this.http.get<Plan[]>(`${this.apiUrl}/plans`);
    }

    processPayment(request: ProcessPaymentRequest): Observable<PaymentResponse> {
        return this.http.post<ApiResponse<PaymentResponse>>(`${this.apiUrl}/payments`, request).pipe(
            map(response => response.data)
        );
    }

    getPaymentStatus(externalId: string): Observable<PaymentResponse> {
        return this.http.get<ApiResponse<PaymentResponse>>(`${this.apiUrl}/payments/${externalId}`).pipe(
            map(response => response.data)
        );
    }
}

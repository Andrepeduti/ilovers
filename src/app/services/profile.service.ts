import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profile {
    id: string;
    name: string;
    age: number | null;
    city: string;
    state: string;
    images: string[];
    bio: string;
    hobbies: string[];
    gender?: string;
    interestedIn?: string;
    hideAge?: boolean;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    errors: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/profiles`;

    constructor() { }

    getProfile(id: string): Observable<Profile> {
        return this.http.get<ApiResponse<Profile>>(`${this.apiUrl}/${id}`).pipe(
            map(response => response.data)
        );
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaths } from '../enums/api-paths.enum';
import { Profile } from '../models/user.interface';
import { MOCK_MY_PROFILE } from '../mocks/profile.mock';
import { delay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    constructor(private http: HttpClient) { }

    getMyProfile(): Observable<Profile> {
        if (!environment.production) {
            console.log('ProfileService: getMyProfile using MOCK data');
            return of(MOCK_MY_PROFILE).pipe(delay(500));
        }
        return this.http.get<Profile>(`${environment.apiUrl}${ApiPaths.PROFILE}`);
    }

    updateProfile(data: Partial<Profile>): Observable<Profile> {
        if (!environment.production) {
            console.log('ProfileService: updateProfile using MOCK data');
            return of({ ...MOCK_MY_PROFILE, ...data }).pipe(delay(1000));
        }
        return this.http.put<Profile>(`${environment.apiUrl}${ApiPaths.PROFILE}`, data);
    }

    getProfileDetails(id: number): Observable<Profile> {
        if (!environment.production) {
            console.log(`ProfileService: getProfileDetails(${id}) using MOCK data`);
            // For mock, just return my profile as a placeholder or create a specific one if needed
            return of(MOCK_MY_PROFILE).pipe(delay(500));
        }
        return this.http.get<Profile>(`${environment.apiUrl}${ApiPaths.PROFILE}/${id}`);
    }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { ApiPaths } from '../enums/api-paths.enum';

export interface UploadResponse {
    data: string; // The URL
    success: boolean;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private http = inject(HttpClient);
    // Use ApiPaths to ensure consistency and avoid duplication
    private apiUrl = `${environment.apiUrl}${ApiPaths.UPLOAD_IMAGE}`;

    uploadImage(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<UploadResponse>(this.apiUrl, formData).pipe(
            map(response => {
                if (response.data) {
                    return response.data;
                }
                throw new Error(response.message || 'Upload failed');
            })
        );
    }
}

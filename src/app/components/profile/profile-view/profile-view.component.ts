import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { IProfile } from '../models/profile.interfaces';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
    selector: 'app-profile-view',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './profile-view.component.html',
    styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);

    profile: IProfile | null = null;
    currentPhotoIndex = 0;
    showLoader = true;
    isDetailsActive = false;

    tagIcons: { [key: string]: string } = {
        'Fotografia': 'fas fa-camera',
        'Viagens': 'fas fa-plane',
        'Música': 'fas fa-music',
        'Arte': 'fas fa-palette',
        'Esportes': 'fas fa-futbol',
        'Culinária': 'fas fa-utensils',
        'Leitura': 'fas fa-book',
        'Cinema': 'fas fa-film',
        'Tecnologia': 'fas fa-laptop-code',
        'Natureza': 'fas fa-tree',
        'Yoga': 'fas fa-spa'
    };


    ngOnInit() {
        this.checkAndLoadProfile();
    }

    checkAndLoadProfile() {
        // Try to get from signal/cache first
        const cached = this.authService.currentUser();
        if (cached) {
            if (!cached.isComplete) {
                this.router.navigate(['/profile/edit']);
                return;
            }
            this.profile = { ...cached };

            if (this.profile) {
                const anyProfile = this.profile as any;
                // Map name -> displayName
                if (!this.profile.displayName && anyProfile.name) {
                    this.profile.displayName = anyProfile.name;
                }
                // Map images -> photos
                if (!this.profile.photos && anyProfile.images) {
                    this.profile.photos = anyProfile.images;
                }
            }

            // Ensure photos is an array of strings and filter out nulls/empty
            if (!this.profile) {
                this.profile = { ...cached }; // Should ideally not happen if cached is truthy
            }
            if (this.profile) {
                if (!this.profile.photos) {
                    this.profile.photos = [];
                } else {
                    this.profile.photos = this.profile.photos.filter((p: string | null) => !!p);
                }
            }

            this.showLoader = false;
        } else {
            // Fallback to API
            this.authService.getProfile().subscribe({
                next: (res) => {
                    if (res.data) {
                        if (!res.data.isComplete) {
                            this.router.navigate(['/profile/edit']);
                            return;
                        }
                        this.profile = { ...res.data };

                        if (this.profile) {
                            const anyProfile = this.profile as any;
                            // Map name -> displayName
                            if (!this.profile.displayName && anyProfile.name) {
                                this.profile.displayName = anyProfile.name;
                            }
                            // Map images -> photos
                            if (!this.profile.photos && anyProfile.images) {
                                this.profile.photos = anyProfile.images;
                            }
                        }

                        // Ensure photos is an array
                        if (this.profile) {
                            if (!this.profile.photos) {
                                this.profile.photos = [];
                            } else {
                                this.profile.photos = this.profile.photos.filter((p: string | null) => !!p);
                            }
                        }

                        this.authService.currentUser.set(res.data);
                    }
                    this.showLoader = false;
                },
                error: (err) => {
                    console.error('Error loading profile', err);
                    this.showLoader = false;
                    // Ideally handle error or redirect
                }
            });
        }
    }

    nextPhoto(event?: Event) {
        if (event) event.stopPropagation();
        if (!this.profile || !this.profile.photos || this.profile.photos.length === 0) return;

        if (this.currentPhotoIndex < this.profile.photos.length - 1) {
            this.currentPhotoIndex++;
        } else {
            this.currentPhotoIndex = 0; // Loop or stop? Feed loops, let's loop
        }
    }

    prevPhoto(event?: Event) {
        if (event) event.stopPropagation();
        if (!this.profile || !this.profile.photos || this.profile.photos.length === 0) return;

        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
        } else {
            this.currentPhotoIndex = this.profile.photos.length - 1;
        }
    }

    // Simple touch/click logic for photo navigation
    // Divide screen in half: left click = prev, right click = next
    onCardClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        // Don't trigger if clicked on a button or detail
        if (target.closest('button') || target.closest('.profile-info')) return;

        const width = window.innerWidth;
        const x = event.clientX;

        if (x < width / 2) {
            this.prevPhoto();
        } else {
            this.nextPhoto();
        }
    }

    toggleDetails() {
        this.isDetailsActive = !this.isDetailsActive;
    }

    editProfile() {
        this.router.navigate(['/profile/edit']);
    }
}

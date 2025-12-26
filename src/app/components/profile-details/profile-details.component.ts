import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Profile, ProfileService } from '../../services/profile.service';

@Component({
    selector: 'app-profile-details',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile-details.component.html',
    styleUrl: './profile-details.component.scss'
})
export class ProfileDetailsComponent implements OnInit {
    profile: Profile | undefined;
    currentPhotoIndex = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private profileService: ProfileService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.profileService.getProfile(id).subscribe({
                next: (profile) => {
                    this.profile = profile;
                },
                error: (err) => {
                    console.error('Error loading profile', err);
                    // Redirect or show error
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/chat', this.profile?.id]);
    }

    nextPhoto() {
        if (!this.profile) return;
        if (this.currentPhotoIndex < this.profile.images.length - 1) {
            this.currentPhotoIndex++;
        } else {
            this.currentPhotoIndex = 0; // Loop or stop? Let's loop for this viewer
        }
    }

    prevPhoto() {
        if (!this.profile) return;
        if (this.currentPhotoIndex > 0) {
            this.currentPhotoIndex--;
        } else {
            this.currentPhotoIndex = this.profile.images.length - 1;
        }
    }
}

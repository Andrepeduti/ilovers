import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchModalComponent } from '../match-modal/match-modal.component';

import { Profile, ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, MatchModalComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  profiles: Profile[] = [];


  currentIndex = 0;
  currentPhotoIndex = 0;

  isSuperLikeActive = false;
  isLikeActive = false;
  isRejectActive = false;

  // Interaction State
  private startX = 0;
  private isDragging = false;

  get currentProfile(): Profile | undefined {
    return this.profiles[this.currentIndex];
  }

  nextProfile() {
    if (this.currentIndex < this.profiles.length) {
      this.currentIndex++;
      this.currentPhotoIndex = 0; // Reset photo index for new profile
    } else {
      this.currentIndex = 0;
      this.currentPhotoIndex = 0;
    }
  }

  private lastTouchTime = 0;

  // Carousel Logic
  onTouchStart(event: TouchEvent | MouseEvent) {
    // Ignore emulated mouse events
    if (event instanceof MouseEvent && Date.now() - this.lastTouchTime < 500) {
      return;
    }

    if (window.TouchEvent && event instanceof TouchEvent) {
      this.lastTouchTime = Date.now();
    }

    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
  }

  onTouchEnd(event: TouchEvent | MouseEvent) {
    if (event instanceof MouseEvent && Date.now() - this.lastTouchTime < 500) {
      this.isDragging = false; // Reset anyway but don't action
      return;
    }

    if (window.TouchEvent && event instanceof TouchEvent) {
      this.lastTouchTime = Date.now();
    }

    if (!this.isDragging) return;
    this.isDragging = false;

    const endX = 'changedTouches' in event ? event.changedTouches[0].clientX : (event as MouseEvent).clientX;
    const deltaX = endX - this.startX;

    // Threshold for swipe
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.prevPhoto();
      } else {
        this.nextPhoto();
      }
    } else if (Math.abs(deltaX) < 5) {
      // It's a click/tap (minimal movement)
      // Determine if clicked on left or right side of the screen/card
      const screenWidth = window.innerWidth;
      if (endX < screenWidth / 2) {
        this.prevPhoto();
      } else {
        this.nextPhoto();
      }
    }
  }

  nextPhoto() {
    if (!this.currentProfile) return;
    if (this.currentPhotoIndex < this.currentProfile.images.length - 1) {
      this.currentPhotoIndex++;
    }
  }

  prevPhoto() {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
    }
  }

  showMatchModal = false;
  matchedProfileData: { name: string; photo: string } | null = null;

  constructor(
    private matchService: MatchService,
    private router: Router,
    private profileService: ProfileService
  ) {
    this.profiles = this.profileService.getProfiles();
  }

  onLike() {
    this.isLikeActive = true;
    setTimeout(() => this.isLikeActive = false, 500);

    const profile = this.currentProfile;
    if (profile) {
      console.log('Liked:', profile.name);

      // Mock Match Logic: 50% chance or if ID is even
      // Let's force match for specific IDs for predictable testing, or Math.random()
      const isMatch = Math.random() > 0.5;

      if (isMatch) {
        this.matchedProfileData = {
          name: profile.name,
          // Use first image for avatar
          photo: profile.images[0]
        };

        // Add to globel state
        this.matchService.addMatch({
          id: profile.id,
          name: profile.name,
          photo: profile.images[0],
          viewed: false
        });

        // Show Modal
        setTimeout(() => {
          this.showMatchModal = true;
        }, 300); // Small delay for like animation to be seen
      } else {
        this.nextProfile();
      }
    }
  }

  closeMatchModal() {
    this.showMatchModal = false;
    this.nextProfile(); // Move to next after closing
  }

  startChatFromMatch() {
    this.showMatchModal = false;
    if (this.matchedProfileData && this.currentProfile) {
      // We know the current profile is the one we matched with
      const id = this.currentProfile.id;

      // Add to service again just to be sure/mark as viewed? 
      // Logic handled in onLike, but let's set viewed if starting chat immediately
      // The chat component will handle finding it in the service via getMatches()

      this.router.navigate(['chat', id], {
        state: {
          name: this.matchedProfileData.name,
          photo: this.matchedProfileData.photo
        }
      });

      // We do typically move to next profile in background so when they come back it's fresh
      this.nextProfile();
    }
  }

  onReject() {
    this.isRejectActive = true;
    setTimeout(() => this.isRejectActive = false, 500);

    console.log('Rejected:', this.currentProfile?.name);
    this.nextProfile();
  }

  onSuperLike() {
    console.log('Super Liked', this.currentProfile?.name);
    this.isSuperLikeActive = true;
    setTimeout(() => {
      this.nextProfile();
      this.isSuperLikeActive = false;
    }, 1000);
  }

  isUndoActive = false;

  onUndo() {
    if (this.currentIndex > 0) {
      this.isUndoActive = true;
      setTimeout(() => this.isUndoActive = false, 500);

      this.currentIndex--;
      this.currentPhotoIndex = 0;
    } else {
      console.log('No previous profile');
    }
  }

  isDetailsActive = false;

  toggleDetails() {
    this.isDetailsActive = !this.isDetailsActive;
  }
}

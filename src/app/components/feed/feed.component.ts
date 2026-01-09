import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { MatchModalComponent } from '../match-modal/match-modal.component';
import { FeedService } from '../../core/services/feed.service';
import { ProfileService } from '../../core/services/profile.service';
import { FeedProfile } from '../../core/models/feed.interface';
import { trigger, transition, style, animate, keyframes, state } from '@angular/animations';
import { LoaderComponent } from '../shared/loader/loader.component';
import { NavigationStateService } from '../../core/services/navigation-state.service';
import { FeedbackService } from '../shared/feedback.service';
import { FeedbackCardComponent } from '../shared/feedback-card/feedback-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, MatchModalComponent, LoaderComponent, FeedbackCardComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
  animations: [
    trigger('cardAnimation', [
      state('idle', style({ transform: 'translate(0) rotate(0)' })),

      // Fly Out Right (Like)
      transition('* => flyOutRight', [
        animate('0.6s ease-out', keyframes([
          style({ transform: 'translate(0)', offset: 0 }),
          style({ transform: 'translate(50%, 0)', opacity: 1, offset: 0.3 }),
          style({ transform: 'translate(150%, 0)', opacity: 0, offset: 1 })
        ]))
      ]),

      // Fly Out Left (Reject)
      transition('* => flyOutLeft', [
        animate('0.6s ease-out', keyframes([
          style({ transform: 'translate(0)', offset: 0 }),
          style({ transform: 'translate(-50%, 0)', opacity: 1, offset: 0.3 }),
          style({ transform: 'translate(-150%, 0)', opacity: 0, offset: 1 })
        ]))
      ]),

      // Fly Out Up (Super Like)
      transition('* => flyOutUp', [
        animate('0.6s ease-out', keyframes([
          style({ transform: 'translate(0) rotate(0)', offset: 0 }),
          style({ transform: 'translate(0, -20px) scale(1.1)', opacity: 1, offset: 0.3 }),
          style({ transform: 'translate(0, -150%) scale(0.5)', opacity: 0, offset: 1 })
        ]))
      ]),

      // Incoming Card (Slide In/Enter)
      transition(':enter', [
        style({ transform: 'scale(0.9) translateY(20px)', opacity: 0, zIndex: -1 }),
        animate('0.4s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1) translateY(0)', opacity: 1, zIndex: 0 }))
      ])
    ])
  ]
})
export class FeedComponent implements OnInit {
  private feedService = inject(FeedService);
  private feedbackService = inject(FeedbackService);
  private matchService = inject(MatchService);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private navService = inject(NavigationStateService);

  get isPremium(): boolean {
    const profile = this.authService.currentUser();
    return profile?.isPremium === true;
  }

  profiles: FeedProfile[] = [];
  currentIndex = 0;
  currentPhotoIndex = 0;
  loading = false;
  myPhotoUrl: string = '';

  // Feedback State
  showingFeedback = false;
  feedbackIndex = -1; // Random index to show feedback

  // Animation State
  animationState: 'idle' | 'flyOutLeft' | 'flyOutRight' | 'flyOutUp' = 'idle';

  isSuperLikeActive = false;
  isLikeActive = false;
  isRejectActive = false;
  showMatchModal = false;
  matchedProfileData: { name: string; photo: string } | null = null;
  // Interaction State
  private startX = 0;
  private isDragging = false;
  private lastTouchTime = 0;

  isDetailsActive = false;
  isUndoActive = false;


  // Smart Limits
  showUpgradePopover = false;
  shakeTimer = false;
  timeUntilReset = '';
  private timerInterval: any;

  get currentProfile(): FeedProfile | undefined {
    return this.profiles[this.currentIndex];
  }

  limits = { likes: 0, superLikes: 0, rewinds: 0 };
  private interactedProfileIds = new Set<string>();

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
    this.initialLoad();
    this.loadLimits();
    this.startTimer();

    // Check backend for eligibility every time
    this.feedbackService.checkEligibility().subscribe({
      next: (res: any) => {
        const data = res.data || res;
        if (data.eligible) {
          // Schedule random index
          this.feedbackIndex = Math.floor(Math.random() * 5) + 2;
        } else {
          this.feedbackIndex = -1;
        }
      },
      error: err => console.error('Eligibility check failed', err)
    });
  }

  initialLoad() {
    this.loadMyProfile();

    // Check for saved state
    const savedState = this.feedService.getState();
    if (savedState) {
      this.profiles = savedState.profiles;
      this.currentIndex = savedState.index;
      // If we restore state, we assume loading is done
      this.loading = false;
    } else {
      this.loadFeed();
    }
  }

  ngOnDestroy() {
    // Save state before leaving
    this.feedService.saveState(this.profiles, this.currentIndex);

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadLimits() {
    this.feedService.getLimits().subscribe({
      next: (data) => {
        this.limits = {
          likes: data.likesRemaining,
          superLikes: data.superLikesRemaining,
          rewinds: data.rewindsRemaining
        };
      },
      error: (err) => console.error('Error loading limits', err)
    });
  }

  loadMyProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        // Run test AFTER profile is loaded
        const photo = this.authService.currentCoverPhoto();
        if (photo) {
          this.myPhotoUrl = photo;
        } else if (profile.photos && profile.photos.length > 0) {
          // Fallback
          this.myPhotoUrl = profile.photos[0];
        }

        //this.testMatchModal();
      },
      error: (err) => console.error('Error loading my profile', err)
    });
  }

  loadFeed(resetIndex = false) {
    if (this.loading) return;
    this.loading = true;

    if (resetIndex) {
      this.currentIndex = 0;
      this.profiles = []; // Clear current list if forcing refresh
    }

    this.feedService.getFeed(10).subscribe({
      next: (data) => {
        // Append new profiles to the list, filtering duplicates just in case
        const existingIds = new Set(this.profiles.map(p => p.id));

        // Filter out locally known interactions (race condition fix) AND existing items
        const newProfiles = data.filter(p => !existingIds.has(p.id) && !this.interactedProfileIds.has(p.id));

        if (resetIndex) {
          this.profiles = newProfiles;
        } else {
          this.profiles = [...this.profiles, ...newProfiles];
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading feed', err);
        this.loading = false;
      }
    });
  }

  refreshFeed() {
    this.feedService.clearState();
    this.loadFeed(true);
  }

  nextProfile() {
    // Reset state first implicitly by changing index which destroys component if used with trackBy/ngFor or manually resetting
    this.animationState = 'idle';

    if (this.showingFeedback) return; // If feedback is showing, don't advance profile

    if (this.currentIndex < this.profiles.length) {
      this.currentIndex++;
      this.currentPhotoIndex = 0;
      // Allow undoing this new action if premium
      // this.canUndo = true; // Assuming this is a property that needs to be defined
    }

    // Feedback Logic
    if (this.currentIndex === this.feedbackIndex) {
      this.showingFeedback = true;
      // Backend handles "pending" implicitly: if you don't submit/skip, next time you check eligibility it returns true.
      return;
    }

    // Check buffer
    if (this.profiles.length - this.currentIndex <= 3) {
      this.loadFeed();
    }
  }

  onFeedbackCompleted(event: any) {
    this.showingFeedback = false;

    if (event.action === 'skip') {
      this.feedbackService.submitFeedback(null, null, true).subscribe(); // Log skip to backend
    } else if (event.action === 'submit') {
      this.feedbackService.submitFeedback(event.score, event.comment, false).subscribe({
        error: err => console.error('Feedback submit error', err)
      });
    }
  }

  // New state for Like limit
  showLikeUpgradePopover = false;

  private closeAllPopovers() {
    this.showUndoPopover = false;
    this.showUpgradePopover = false; // Super Like
    this.showLikeUpgradePopover = false;
  }

  onLike() {
    // 1. Check Limit
    if (this.limits.likes <= 0) {
      const wasOpen = this.showLikeUpgradePopover;
      this.closeAllPopovers();
      this.showLikeUpgradePopover = !wasOpen;
      return;
    }

    const profile = this.currentProfile;
    if (!profile) return;

    this.isLikeActive = true;
    this.animationState = 'flyOutRight'; // Trigger Animation
    setTimeout(() => this.isLikeActive = false, 500);

    // Track locally
    this.interactedProfileIds.add(profile.id);

    // Call API in background
    this.feedService.like(profile.id).subscribe({
      next: (response) => {
        this.limits.likes = Math.max(0, this.limits.likes - 1); // Decrement
        if (response.isMatch) {
          this.handleMatch(profile, response.chatId);
        }
      },
      error: (err: any) => {
        console.error('Like error', err);
        if (err.error?.error?.code === 'Limit.LikeReached') {
          this.limits.likes = 0; // Sync to 0 just in case
          this.closeAllPopovers();
          this.showLikeUpgradePopover = true;
        }
      }
    });

    // Advance UI with delay for animation
    setTimeout(() => {
      this.nextProfile();
    }, 400); // Sync with animation time
  }

  onReject() {
    this.closeAllPopovers();
    const profile = this.currentProfile;
    if (!profile) return;

    this.isRejectActive = true;
    this.animationState = 'flyOutLeft'; // Trigger Animation
    setTimeout(() => this.isRejectActive = false, 500);

    // Track locally
    this.interactedProfileIds.add(profile.id);

    this.feedService.dislike(profile.id).subscribe({
      error: (err: any) => console.error('Dislike error', err)
    });

    setTimeout(() => {
      this.nextProfile();
    }, 400); // Sync with animation time
  }

  onSuperLike() {
    // 1. Check Limit
    if (this.limits.superLikes <= 0) {
      if (!this.isPremium) {
        // Free User -> Show Popover
        const wasOpen = this.showUpgradePopover;
        this.closeAllPopovers();
        this.showUpgradePopover = !wasOpen;
      } else {
        // Premium User -> Shake Timer
        this.shakeTimer = true;
        setTimeout(() => this.shakeTimer = false, 500);
      }
      return;
    }

    const profile = this.currentProfile;
    if (!profile) return;

    this.isSuperLikeActive = true;
    this.animationState = 'flyOutUp'; // Trigger Animation
    setTimeout(() => this.isSuperLikeActive = false, 1000);

    // Track locally
    this.interactedProfileIds.add(profile.id);

    this.feedService.superLike(profile.id).subscribe({
      next: (response) => {
        this.limits.superLikes = Math.max(0, this.limits.superLikes - 1); // Decrement
        if (response.isMatch) {
          this.handleMatch(profile, response.chatId);
        }
      },
      error: (err) => {
        console.error('SuperLike error', err);
        if (err.error?.error?.code === 'Limit.SuperLikeReached') {
          this.limits.superLikes = 0;
          // If backend says limit reached but frontend thought otherwise, show UI helper now
          if (!this.isPremium) {
            this.closeAllPopovers();
            this.showUpgradePopover = true;
          }
        }
      }
    });

    // Delay to let animation play
    setTimeout(() => {
      this.nextProfile();
    }, 600); // Slightly longer for super like
  }

  goToPlans() {
    this.navService.allowPlansAccess();
    this.router.navigate(['/plans'], { queryParams: { returnUrl: '/feed' } });
  }

  private startTimer() {
    this.updateTimer(); // Initial call
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  private updateTimer() {
    const now = new Date();
    const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));

    // Tomorrow 00:00 UTC
    const tomorrowUtc = new Date(nowUtc);
    tomorrowUtc.setUTCDate(nowUtc.getUTCDate() + 1);
    tomorrowUtc.setUTCHours(0, 0, 0, 0);

    const diff = tomorrowUtc.getTime() - nowUtc.getTime();

    if (diff <= 0) {
      this.timeUntilReset = '00:00:00';
      // Optionally reload limits here if we hit 0?
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeUntilReset = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  private router = inject(Router);

  handleMatch(profile: FeedProfile, chatId?: string) {
    this.matchedProfileData = {
      name: profile.displayName,
      photo: profile.mainPhotoUrl || profile.photos[0]
    };

    // Store chatId temporarily for the modal action
    this.matchedChatId = chatId;

    this.matchService.addMatch({
      id: profile.id,
      name: profile.displayName,
      photo: profile.mainPhotoUrl,
      isNew: true,
      viewed: false,
      chatId: chatId
    });

    this.showMatchModal = true;
  }

  matchedChatId?: string;

  closeMatchModal() {
    this.showMatchModal = false;
    this.matchedChatId = undefined;
    // We already moved to next profile in background
  }

  startChatFromMatch() {
    this.closeMatchModal();
    this.router.navigate(['/actions']);
  }

  // Carousel & Touch Logic (Simplified/Kept similar)
  onTouchStart(event: TouchEvent | MouseEvent) {
    this.isDragging = true;
    this.startX = 'touches' in event ? event.touches[0].clientX : (event as MouseEvent).clientX;
  }

  onTouchEnd(event: TouchEvent | MouseEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const endX = 'changedTouches' in event ? event.changedTouches[0].clientX : (event as MouseEvent).clientX;
    const deltaX = endX - this.startX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) this.prevPhoto();
      else this.nextPhoto();
    } else if (Math.abs(deltaX) < 5) {
      const screenWidth = window.innerWidth;
      if (endX < screenWidth / 2) this.prevPhoto();
      else this.nextPhoto();
    }
  }

  nextPhoto() {
    if (!this.currentProfile) return;
    if (this.currentPhotoIndex < this.currentProfile.photos.length - 1) {
      this.currentPhotoIndex++;
    }
  }

  prevPhoto() {
    if (this.currentPhotoIndex > 0) this.currentPhotoIndex--;
  }

  // New state for Undo limit
  canUndo = false;
  showUndoPopover = false;

  onUndo() {
    // 1. Check if we can physically undo (index > 0)
    if (this.currentIndex <= 0) return;

    // 2. Check Permissions/Limits
    if (!this.isPremium) {
      const wasOpen = this.showUndoPopover;
      this.closeAllPopovers();
      this.showUndoPopover = !wasOpen;
      return;
    }

    // Premium Logic
    if (this.limits.rewinds <= 0) {
      // Limit Reached -> Show Timer (Shake)
      this.shakeTimer = true;
      setTimeout(() => this.shakeTimer = false, 500);
      return;
    }

    // Check if current card allows undo (fresh swiped)
    if (!this.canUndo) {
      // Already used undo for this card or invalid state
      return;
    }

    // 3. Perform Undo
    this.isUndoActive = true;
    setTimeout(() => this.isUndoActive = false, 500);

    this.feedService.rewind().subscribe({
      next: () => {
        this.limits.rewinds = Math.max(0, this.limits.rewinds - 1);
      },
      error: (err) => console.error(err)
    });

    this.currentIndex--;
    this.currentPhotoIndex = 0;

    // Consume the undo allowance
    this.canUndo = false;
  }

  toggleDetails() {
    this.isDetailsActive = !this.isDetailsActive;
  }

  testMatchModal() {
    // Force wait for myPhotoUrl to likely be populated
    setTimeout(() => {
      const mockProfile: FeedProfile = this.currentProfile || {
        id: 'mock-id',
        displayName: 'Teste Name',
        age: 25,
        city: 'São Paulo',
        state: 'SP',
        bio: 'Bio teste',
        mainPhotoUrl: 'https://placehold.co/600x400',
        photos: ['https://placehold.co/600x400'],
        hobbies: ['Teste']
      };

      this.matchedProfileData = {
        name: mockProfile.displayName,
        photo: mockProfile.mainPhotoUrl || mockProfile.photos[0]
      };
      this.showMatchModal = true;
    }, 1000);
  }
}

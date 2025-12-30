import { Component, ViewChild, ElementRef, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CropperModalComponent } from '../shared/cropper-modal/cropper-modal.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IProfile } from './models/profile.interfaces';
import { AuthService } from '../../core/services/auth.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { ImageService } from '../../core/services/image.service';
import { Observable, forkJoin } from 'rxjs';
import { ChatRealtimeService } from '../../services/chat-realtime.service';
import { NavigationStateService } from '../../core/services/navigation-state.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, CropperModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionArea') descriptionArea!: ElementRef<HTMLTextAreaElement>;

  isResizing = false;
  private startY = 0;
  private startHeight = 0;
  private resizeMouseMoveListener: any;
  private resizeMouseUpListener: any;
  private authService = inject(AuthService);
  private chatRealtimeService = inject(ChatRealtimeService);
  private navService = inject(NavigationStateService);

  photos: (string | null)[] = [null, null, null, null, null, null, null, null];
  showAgeInfo = false;
  showCoverInfo = false;
  showLoader = false;
  profile: IProfile = {
    displayName: '',
    bio: '',
    age: null,
    hideAge: false,
    state: '',
    city: '',
    gender: '',
    interestedIn: '',
    ageRange: {
      min: null,
      max: null
    },
    seeAllAges: false,
    hobbies: [] as string[],
    photos: [] as (string | null)[]
  };
  cachedProfile = this.authService.currentUser;
  newHobby = '';
  showLogoutModal = false;
  showHelpModal = false;
  helpType = 'duvida';
  helpMessage = '';
  ageInvalid = false;
  requiredAgeInput = true;
  saveError = '';

  availableInterests = ['Fotografia', 'Viagens', 'Música', 'Arte', 'Esportes', 'Culinária', 'Leitura', 'Cinema', 'Tecnologia', 'Natureza', 'Yoga'];

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

  private originalProfile: any;
  private originalPhotos: (string | null)[] = [];

  private currentIndexForUpload: number = -1;

  get photoCount(): number {
    return this.photos.filter(p => p !== null).length;
  }

  get suggestedInterests(): string[] {
    return this.availableInterests.filter(i => !this.profile.hobbies.includes(i));
  }

  get validatePhotos() {
    return this.photos[0] !== null;
  }

  get isFormValid(): boolean {
    const p = this.profile;

    if (!p.displayName || !p.age || !p.state || !p.city || !p.gender || !p.interestedIn || !p.bio) {
      return false;
    }

    let isAgeRangeValid = true;
    if (!p.seeAllAges) {
      const min = p.ageRange.min;
      const max = p.ageRange.max;

      isAgeRangeValid = (min !== null && min >= 18) && (max !== null && max >= 18);
    }

    const isAgeValid = p.age >= 18;
    const nameHasNoNumbers = !/\d/.test(p.displayName);
    const cityHasNoNumbers = !/\d/.test(p.city);
    const stateValid = p.state.length <= 2 && !/\d/.test(p.state);

    const photoValid = this.photos[0] !== null;

    return isAgeValid && nameHasNoNumbers && cityHasNoNumbers && stateValid && photoValid && isAgeRangeValid;
  }

  get isDirty(): boolean {
    const profileChanged = JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
    const photosChanged = JSON.stringify(this.photos) !== JSON.stringify(this.originalPhotos);
    return profileChanged || photosChanged;
  }

  get isAgeRangeInvalid(): boolean {
    if (this.profile.seeAllAges) return false;
    const min = this.profile.ageRange.min;
    const max = this.profile.ageRange.max;

    const minInvalid = min !== null && min < 18;
    const maxInvalid = max !== null && max < 18;

    return minInvalid || maxInvalid;
  }

  get showAgeRangeAsterisk(): boolean {
    if (this.profile.seeAllAges) return false;

    const min = this.profile.ageRange.min;
    const max = this.profile.ageRange.max;

    const minValid = min !== null && min >= 18;
    const maxValid = max !== null && max >= 18;

    return !minValid || !maxValid;
  }

  get showAgeAsterisk(): boolean {
    const age = this.profile.age;
    return !age || age < 18;
  }

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.checkAndLoadProfile();
    console.log('Profile dps do oninit:', this.profile);
  }

  checkAndLoadProfile() {
    if (this.cachedProfile()) {
      console.log('Loading profile from signal cache', this.cachedProfile());
      this.populateForm(this.cachedProfile());
      this.updateOriginalState();
    } else {
      // Fallback to API
      this.loadProfile();
    }
  }

  loadProfile() {
    this.toggleLoader();
    this.authService.getProfile().subscribe({
      next: (response) => {
        console.log('Profile loaded:', response);
        if (response && response.data) {
          console.log('RAW PROFILE DATA:', response.data);
          this.populateForm(response.data);
        }
        this.updateOriginalState();
        this.toggleLoader();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.toggleLoader();
        this.updateOriginalState();
      }
    });
  }



  populateForm(data: any) {
    console.log('Profile data:', data);
    this.profile = {
      ...this.profile,
      displayName: data.name || data.displayName || '', // Map 'name' from backend
      bio: data.bio || '',
      age: data.age || null,
      hideAge: data.hideAge || false,
      state: data.state || '',
      city: data.city || '',
      gender: data.gender || '',
      interestedIn: data.interestedIn || '',
      hobbies: [...(data.hobbies || [])],
      ageRange: {
        min: data.ageRange?.min || null,
        max: data.ageRange?.max || null
      },
      seeAllAges: data.seeAllAges || false,
      isComplete: data.isComplete,
      isPremium: data.isPremium || data.IsPremium || false,
      premiumExpiresAt: data.premiumExpiresAt ? new Date(data.premiumExpiresAt) : (data.PremiumExpiresAt ? new Date(data.PremiumExpiresAt) : undefined)
    };

    const images = data.images || data.photos; // Map 'images' from backend
    if (images && Array.isArray(images)) {
      this.photos = [...images, ...Array(8).fill(null)].slice(0, 8);
    } else {
      this.photos = Array(8).fill(null);
    }
    this.profile.photos = this.photos; // Ensure usage

    // Update Signal
    if (this.photos[0]) {
      this.authService.currentCoverPhoto.set(this.photos[0]);
    }
  }

  logout() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.chatRealtimeService.stopConnection();
    this.authService.logout();
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  openHelpModal() {
    this.showHelpModal = true;
    this.helpType = 'duvida';
    this.helpMessage = '';
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }

  updateOriginalState() {
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
    this.originalPhotos = [...this.photos];
  }

  onlyLetters(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    this.profile.state = input.value;
  }

  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[0-9]/g, '');
    this.profile.displayName = input.value;
  }

  blockNonNumeric(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ];

    if (allowedKeys.includes(event.key)) return;

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onAgeInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    const hasLetter = /[a-zA-Z]/.test(rawValue);

    if (hasLetter) {
      input.value = this.profile.age ? String(this.profile.age) : '';
      return;
    }

    let value = rawValue.replace(/\D/g, '').slice(0, 2);
    input.value = value;

    this.profile.age = value ? Number(value) : null;

    const age = Number(value);
    this.ageInvalid = !!value && age < 18;
  }

  onAgeRangeInput(event: Event, field: 'min' | 'max') {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 2);
    input.value = value;

    this.profile.ageRange[field] = value ? Number(value) : null;
  }

  onHideAgeChange() {
    if (this.profile.hideAge) {
      this.ageInvalid = false;
    }
  }

  onSeeAllAgesChange() {
    if (this.profile.seeAllAges) {
      this.profile.ageRange.min = null;
      this.profile.ageRange.max = null;
    }
  }

  toggleAgeInfo() {
    this.showAgeInfo = !this.showAgeInfo;
    if (this.showAgeInfo) this.showCoverInfo = false;
  }

  toggleCoverInfo() {
    this.showCoverInfo = !this.showCoverInfo;
    if (this.showCoverInfo) this.showAgeInfo = false;
  }

  toggleLoader() {
    this.showLoader = !this.showLoader;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showAgeInfo) {
      this.showAgeInfo = false;
    }
    if (this.showCoverInfo) {
      this.showCoverInfo = false;
    }
  }

  addHobby(hobby?: string) {
    const value = hobby || this.newHobby.trim();
    if (value && !this.profile.hobbies.includes(value)) {
      this.profile.hobbies.push(value);
    }
    this.newHobby = '';
  }

  removeHobby(hobby: string) {
    this.profile.hobbies = this.profile.hobbies.filter(h => h !== hobby);
  }

  onPhotoClick(index: number) {
    this.currentIndexForUpload = index;
    this.fileInput.nativeElement.click();
  }

  removePhoto(index: number, event: Event) {
    event.stopPropagation();
    this.photos[index] = null;
    this.pendingFiles.delete(index);
  }

  private imageService = inject(ImageService);

  private pendingFiles: Map<number, File> = new Map();

  showCropper = false;
  imageChangedEvent: any = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.currentIndexForUpload !== -1) {
      if (file.size > 5 * 1024 * 1024) {
        this.saveError = 'A imagem deve ter no máximo 5MB.';
        this.fileInput.nativeElement.value = '';
        return;
      }
      this.imageChangedEvent = event;
      this.showCropper = true;
    }
  }

  onCropConfirm(blob: Blob) {
    if (this.currentIndexForUpload !== -1 && blob) {
      const file = new File([blob], 'cropped-profile.png', { type: 'image/png' });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos[this.currentIndexForUpload] = e.target.result;
        this.pendingFiles.set(this.currentIndexForUpload, file);
        this.showCropper = false;
        this.fileInput.nativeElement.value = ''; // clear input
      };
      reader.readAsDataURL(blob);
    }
  }

  onCropCancel() {
    this.showCropper = false;
    this.fileInput.nativeElement.value = ''; // clear input to allow re-selecting same file
  }

  startResize(event: MouseEvent) {
    event.preventDefault();
    this.isResizing = true;
    this.startY = event.clientY;
    this.startHeight = this.descriptionArea.nativeElement.offsetHeight;

    this.resizeMouseMoveListener = this.onResize.bind(this);
    this.resizeMouseUpListener = this.stopResize.bind(this);

    window.addEventListener('mousemove', this.resizeMouseMoveListener);
    window.addEventListener('mouseup', this.resizeMouseUpListener);
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing) return;

    const deltaY = event.clientY - this.startY;
    const newHeight = Math.max(80, this.startHeight + deltaY);
    this.descriptionArea.nativeElement.style.height = `${newHeight}px`;
  }

  stopResize() {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.resizeMouseMoveListener);
    window.removeEventListener('mouseup', this.resizeMouseUpListener);
  }

  saveProfile() {
    if (!this.isFormValid || !this.isDirty) return;

    this.toggleLoader();
    this.saveError = ''; // Clear previous errors

    // 1. Upload Pending Files first
    if (this.pendingFiles.size > 0) {
      const uploadObservables: Observable<any>[] = [];
      const indexes: number[] = [];

      this.pendingFiles.forEach((file, index) => {
        indexes.push(index);
        uploadObservables.push(this.imageService.uploadImage(file, false));
      });

      // Use forkJoin to upload all in parallel
      forkJoin(uploadObservables).subscribe({
        next: (urls: string[]) => {
          // Replace local previews with real S3 URLs
          urls.forEach((url, i) => {
            const photoIndex = indexes[i];
            this.photos[photoIndex] = url;
          });

          // Clear pending files as they are uploaded
          this.pendingFiles.clear();

          // 2. Now save the profile with real URLs
          this.performProfileUpdate();
        },
        error: (err) => {
          console.error('Batch upload error:', err);
          this.toggleLoader();
          this.saveError = 'Erro ao enviar algumas imagens. Tente novamente.';
        }
      });
    } else {
      // No new images, just save text data
      this.performProfileUpdate();
    }
  }

  private performProfileUpdate() {
    this.profile.photos = this.photos;

    console.log('Saving profile:', this.profile);

    this.authService.updateProfile(this.profile).subscribe({
      next: (response: any) => {
        // Update with the full response from backend to ensure we have the latest flags (like isComplete)
        if (response && response.data) {
          this.populateForm(response.data);
          this.authService.currentUser.set(response.data);

          if (response.data.photos && response.data.photos.length > 0) {
            this.authService.currentCoverPhoto.set(response.data.photos[0]);
          }
        } else {
          this.authService.currentUser.set(this.profile);
          if (this.profile.photos && this.profile.photos.length > 0) {
            this.authService.currentCoverPhoto.set(this.profile.photos[0]);
          }
        }

        this.updateOriginalState();
        this.toggleLoader();
        this.saveError = '';
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        this.toggleLoader();

        const errorData = err.error?.error;
        if (errorData) {
          const details = errorData.details || errorData.validationErrors;

          if (errorData.code === 'VALIDATION_ERROR' && details?.length > 0) {
            this.saveError = details[0].message;
          } else if (errorData.message) {
            this.saveError = errorData.message;
          } else {
            this.saveError = 'Não foi possível salvar o perfil. Tente novamente.';
          }
        } else {
          this.saveError = 'Não foi possível salvar o perfil. Verifique sua conexão e tente novamente.';
        }
      }
    });
  }
  goBack() {
    this.router.navigate(['/profile']);
  }

  navigateToPlans() {
    this.navService.allowPlansAccess();
    this.router.navigate(['/plans'], { queryParams: { returnUrl: '/profile' } });
  }
}

import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IProfile } from './models/profile.interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('descriptionArea') descriptionArea!: ElementRef<HTMLTextAreaElement>;

  // Resize State
  isResizing = false;
  private startY = 0;
  private startHeight = 0;
  private resizeMouseMoveListener: any;
  private resizeMouseUpListener: any;

  // Photo slots (8 total)
  photos: (string | null)[] = [null, null, null, null, null, null, null, null];

  // Basic Info
  profile: IProfile = {
    name: '',
    description: '',
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
    interests: [] as string[]
  };

  get validatePhotos() {
    return this.photos.length > 0 && this.photos.find((photo) => photo !== null)
  }

  get isFormValid(): boolean {
    const p = this.profile;

    // Basic presence checks
    if (!p.name || !p.age || !p.state || !p.city || !p.gender || !p.interestedIn || !p.description) {
      return false;
    }

    // Age Range Validation (Conditional)
    let isAgeRangeValid = true;
    if (!p.seeAllAges) {
      const min = p.ageRange.min;
      const max = p.ageRange.max;

      // Both must be present AND >= 18
      isAgeRangeValid = (min !== null && min >= 18) && (max !== null && max >= 18);
    }

    // Advanced validations
    const isAgeValid = p.age >= 18;
    const nameHasNoNumbers = !/\d/.test(p.name);
    const cityHasNoNumbers = !/\d/.test(p.city);
    // State: max 2 chars, no numbers
    const stateValid = p.state.length <= 2 && !/\d/.test(p.state);
    const photoValid = this.photos.some(photo => photo != null);

    return isAgeValid && nameHasNoNumbers && cityHasNoNumbers && stateValid && photoValid && isAgeRangeValid;
  }

  get isDirty(): boolean {
    const profileChanged = JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
    const photosChanged = JSON.stringify(this.photos) !== JSON.stringify(this.originalPhotos);
    return profileChanged || photosChanged;
  }

  // Verify if Age Range is Invalid (min < 18 or max < 18)
  // Returns TRUE if INVALID (to show error), FALSE if VALID or incomplete
  get isAgeRangeInvalid(): boolean {
    if (this.profile.seeAllAges) return false;
    const min = this.profile.ageRange.min;
    const max = this.profile.ageRange.max;

    // Check if any entered value is < 18
    const minInvalid = min !== null && min < 18;
    const maxInvalid = max !== null && max < 18;

    return minInvalid || maxInvalid;
  }

  newInterest = '';

  // Predefined interests tags
  availableInterests = ['Fotografia', 'Viagens', 'Música', 'Arte', 'Esportes', 'Culinária', 'Leitura', 'Cinema', 'Tecnologia', 'Natureza', 'Yoga'];

  // For dirty checking
  private originalProfile: any;
  private originalPhotos: (string | null)[] = [];

  private currentIndexForUpload: number = -1;

  constructor(private router: Router) { }

  ngOnInit() {
    this.updateOriginalState();
  }

  showLogoutModal = false;

  logout() {
    this.showLogoutModal = true;
  }

  confirmLogout() {
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  updateOriginalState() {
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
    this.originalPhotos = [...this.photos];
  }

  onlyLetters(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove numbers and special chars, allow letters and spaces
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    this.profile.state = input.value; // Sync model
  }

  // Strict name input handler to block numbers immediately
  onNameInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[0-9]/g, ''); // Remove numbers
    this.profile.name = input.value;
  }

  ageInvalid = false;
  requiredAgeInput = true;

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

    // verifica se o usuário digitou alguma letra
    const hasLetter = /[a-zA-Z]/.test(rawValue);

    // se digitou letra, NÃO limpa tudo
    if (hasLetter) {
      // mantém o valor anterior no input
      input.value = this.profile.age ? String(this.profile.age) : '';
      return;
    }

    // só números
    let value = rawValue.replace(/\D/g, '').slice(0, 3);
    input.value = value;

    // atualiza model
    this.profile.age = value ? Number(value) : null;

    // valida idade mínima
    const age = Number(value);
    this.ageInvalid = !!value && age < 18;
  }


  onHideAgeChange() {
    if (this.profile.hideAge) {
      this.profile.age = null; // Clear age
      this.ageInvalid = false; // Clear invalid flag
    }
  }

  addInterest(interest?: string) {
    const value = interest || this.newInterest.trim();
    if (value && !this.profile.interests.includes(value)) {
      this.profile.interests.push(value);
    }
    this.newInterest = '';
  }

  removeInterest(interest: string) {
    this.profile.interests = this.profile.interests.filter(i => i !== interest);
  }

  onPhotoClick(index: number) {
    this.currentIndexForUpload = index;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.currentIndexForUpload !== -1) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos[this.currentIndexForUpload] = e.target.result;
        // Clear input payload so same file can be selected again if needed
        this.fileInput.nativeElement.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  // Resize Logic
  startResize(event: MouseEvent) {
    event.preventDefault(); // Prevent text selection
    this.isResizing = true;
    this.startY = event.clientY;
    this.startHeight = this.descriptionArea.nativeElement.offsetHeight;

    // Attach listeners to window to handle dragging outside the element
    this.resizeMouseMoveListener = this.onResize.bind(this);
    this.resizeMouseUpListener = this.stopResize.bind(this);

    window.addEventListener('mousemove', this.resizeMouseMoveListener);
    window.addEventListener('mouseup', this.resizeMouseUpListener);
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing) return;

    const deltaY = event.clientY - this.startY;
    const newHeight = Math.max(80, this.startHeight + deltaY); // Min height 80px
    this.descriptionArea.nativeElement.style.height = `${newHeight}px`;
  }

  stopResize() {
    this.isResizing = false;
    window.removeEventListener('mousemove', this.resizeMouseMoveListener);
    window.removeEventListener('mouseup', this.resizeMouseUpListener);
  }

  saveProfile() {
    console.log('teste');
    if (!this.isFormValid || !this.isDirty) return;

    console.log('Saving profile:', this.profile, this.photos);
    // Ideally call a service here

    // Update original state to current state to disable save button until next change
    this.updateOriginalState();

    alert('Perfil salvo com sucesso!');
  }
}

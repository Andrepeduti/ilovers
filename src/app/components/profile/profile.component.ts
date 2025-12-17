import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IProfile } from './models/profile.interfaces';
import { LoaderComponent } from "../shared/loader/loader.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
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

  photos: (string | null)[] = [null, null, null, null, null, null, null, null];

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

  newInterest = '';

  availableInterests = ['Fotografia', 'Viagens', 'Música', 'Arte', 'Esportes', 'Culinária', 'Leitura', 'Cinema', 'Tecnologia', 'Natureza', 'Yoga'];

  private originalProfile: any;
  private originalPhotos: (string | null)[] = [];

  private currentIndexForUpload: number = -1;

  get photoCount(): number {
    return this.photos.filter(p => p !== null).length;
  }

  get validatePhotos() {
    return this.photos[0] !== null;
  }

  get isFormValid(): boolean {
    const p = this.profile;

    if (!p.name || !p.age || !p.state || !p.city || !p.gender || !p.interestedIn || !p.description) {
      return false;
    }

    let isAgeRangeValid = true;
    if (!p.seeAllAges) {
      const min = p.ageRange.min;
      const max = p.ageRange.max;

      isAgeRangeValid = (min !== null && min >= 18) && (max !== null && max >= 18);
    }

    const isAgeValid = p.age >= 18;
    const nameHasNoNumbers = !/\d/.test(p.name);
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

  constructor(private router: Router) { }

  ngOnInit() {
    this.updateOriginalState();
  }

  showLogoutModal = false;
  showHelpModal = false;
  helpType = 'duvida';
  helpMessage = '';

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

  openHelpModal() {
    this.showHelpModal = true;
    this.helpType = 'duvida';
    this.helpMessage = '';
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }

  sendHelp() {
    console.log('Sending help request:', { type: this.helpType, message: this.helpMessage });
    alert('Mensagem enviada com sucesso!');
    this.closeHelpModal();
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
      this.profile.age = null;
      this.ageInvalid = false;
    }
  }

  onSeeAllAgesChange() {
    if (this.profile.seeAllAges) {
      this.profile.ageRange.min = null;
      this.profile.ageRange.max = null;
    }
  }

  showAgeInfo = false;
  showCoverInfo = false;

  toggleAgeInfo() {
    this.showAgeInfo = !this.showAgeInfo;
    if (this.showAgeInfo) this.showCoverInfo = false;
  }

  toggleCoverInfo() {
    this.showCoverInfo = !this.showCoverInfo;
    if (this.showCoverInfo) this.showAgeInfo = false;
  }

  showLoader = false;
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

  removePhoto(index: number, event: Event) {
    event.stopPropagation();
    this.photos[index] = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.currentIndexForUpload !== -1) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos[this.currentIndexForUpload] = e.target.result;
        this.fileInput.nativeElement.value = '';
      };
      reader.readAsDataURL(file);
    }
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

    this.updateOriginalState();

    alert('Perfil salvo com sucesso!');
  }
}

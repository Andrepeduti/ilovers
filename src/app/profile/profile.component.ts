import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Photo slots (8 total)
  photos: (string | null)[] = [null, null, null, null, null, null, null, null];

  // Basic Info
  profile = {
    name: '',
    age: null,
    hideAge: false,
    state: '',
    city: '',
    gender: '',
    interestedIn: '',
    interests: [] as string[]
  };

  // Tag input
  newInterest = '';

  // Predefined interests tags
  availableInterests = ['Fotografia', 'Viagens', 'Música', 'Arte', 'Esportes', 'Culinária', 'Leitura', 'Cinema', 'Tecnologia', 'Natureza', 'Yoga'];

  // For dirty checking
  private originalProfile: any;
  private originalPhotos: (string | null)[] = [];

  private currentIndexForUpload: number = -1;

  constructor() { }

  ngOnInit() {
    this.updateOriginalState();
  }

  updateOriginalState() {
    this.originalProfile = JSON.parse(JSON.stringify(this.profile));
    this.originalPhotos = [...this.photos];
  }

  onlyLetters(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
  }

  ageInvalid = false;

  onAgeInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '').slice(0, 3);
    input.value = value;

    const age = Number(value);

    this.ageInvalid = !!value && age < 18;
  }

  get isFormValid(): boolean {
    const p = this.profile;
    console.log('teste', (p.name === '' && p.age === '' && p.state === '' && p.city === '' && p.gender === ''));
    // All fields mandatory except interests
    return !!(p.name && p.age && p.state && p.city && p.gender && p.interestedIn && (this.photos.find(photo => photo != null) && this.photos.length > 0));
  }

  get isDirty(): boolean {
    const profileChanged = JSON.stringify(this.profile) !== JSON.stringify(this.originalProfile);
    const photosChanged = JSON.stringify(this.photos) !== JSON.stringify(this.originalPhotos);
    return profileChanged || photosChanged;
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

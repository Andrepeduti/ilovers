import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Profile {
  id: number;
  name: string;
  age: number;
  distance: number;
  image: string;
  bio: string;
  hobbies: string[];
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss'
})
export class FeedComponent {
  profiles: Profile[] = [
    {
      id: 1,
      name: 'Sofia',
      age: 24,
      distance: 2,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      bio: 'Apaixonada por fotografia e viagens.',
      hobbies: ['Fotografia', 'Viagens', 'Música']
    },
    {
      id: 2,
      name: 'Lucas',
      age: 27,
      distance: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      bio: 'Curto aventuras ao ar livre e café.',
      hobbies: ['Trilhas', 'Café', 'Surf']
    },
    {
      id: 3,
      name: 'Ana',
      age: 22,
      distance: 10,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      bio: 'Estudante de arquitetura e amante de gatos.',
      hobbies: ['Arquitetura', 'Gatos', 'Design']
    }
  ];

  currentIndex = 0;
  isSuperLikeActive = false;
  isLikeActive = false;
  isRejectActive = false;

  get currentProfile(): Profile | undefined {
    return this.profiles[this.currentIndex];
  }

  nextProfile() {
    if (this.currentIndex < this.profiles.length) {
      this.currentIndex++;
    } else {
      // Reset for demo purposes or handle empty feed
      this.currentIndex = 0;
    }
  }

  onLike() {
    this.isLikeActive = true;
    setTimeout(() => this.isLikeActive = false, 500); // Reset animation

    console.log('Liked:', this.currentProfile?.name);
    // Logic to move to next profile
    this.nextProfile();
  }

  onReject() {
    this.isRejectActive = true;
    setTimeout(() => this.isRejectActive = false, 500); // Reset animation

    console.log('Rejected:', this.currentProfile?.name);
    this.nextProfile();
  }

  onSuperLike() {
    console.log('Super Liked', this.currentProfile?.name);
    this.isSuperLikeActive = true;
    setTimeout(() => {
      this.nextProfile();
      this.isSuperLikeActive = false;
    }, 1000); // Wait for animation
  }

  onUndo() {
      // Logic to undo (optional)
      console.log('Undo');
  }
}

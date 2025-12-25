import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-match-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './match-modal.component.html',
    styleUrl: './match-modal.component.scss'
})
export class MatchModalComponent {
    @Input() matchedProfile: { name: string; photo: string } | null = null;
    @Input() myPhoto: string = '';

    @Output() close = new EventEmitter<void>();
    @Output() startChat = new EventEmitter<void>();

    confettiItems = Array(50).fill(0); // For generating 50 confetti pieces

    onKeepSwiping() {
        this.close.emit();
    }

    onStartChat() {
        this.startChat.emit();
    }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notification-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-modal.component.html',
    styleUrl: './notification-modal.component.scss'
})
export class NotificationModalComponent {
    @Input() data: { fromUserName: string; fromUserPhoto: string | null } | null = null;
    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}

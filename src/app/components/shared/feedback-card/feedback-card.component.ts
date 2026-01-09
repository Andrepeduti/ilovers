import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-feedback-card',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './feedback-card.component.html',
    styleUrls: ['./feedback-card.component.scss']
})
export class FeedbackCardComponent {
    @Output() completed = new EventEmitter<{ action: 'submit' | 'skip', score?: number, comment?: string }>();

    selectedScore: number | null = null; // 1=Bad, 2=Good, 3=Great
    comment: string = '';
    showComment: boolean = false;

    selectScore(score: number) {
        this.selectedScore = score;
        // Show comment for Bad/Good. Optional for Great but we can show it too or hide.
        // User said: "se ele colocar ótimo, comentário não é necessário, mas se ele colocar ruim ou bom o comentário se torna obrigatório."
        this.showComment = true;
    }

    submit() {
        if (!this.selectedScore) return;

        // Validation
        if ((this.selectedScore === 1 || this.selectedScore === 2) && !this.comment.trim()) {
            alert('Por favor, nos conte o motivo da sua avaliação.');
            return;
        }

        this.completed.emit({
            action: 'submit',
            score: this.selectedScore,
            comment: this.comment
        });
    }

    skip() {
        this.completed.emit({ action: 'skip' });
    }

    get isSubmitEnabled(): boolean {
        if (!this.selectedScore) return false;

        // 3 = Great (Optional comment)
        if (this.selectedScore === 3) return true;

        // 1 = Bad, 2 = Good (Mandatory comment)
        return this.comment.trim().length > 0;
    }

    get scoreLabel(): string {
        switch (this.selectedScore) {
            case 1: return 'Ruim';
            case 2: return 'Bom';
            case 3: return 'Ótimo';
            default: return '';
        }
    }
}

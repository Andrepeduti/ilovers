import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService, FeedbackStats, AppFeedback } from '../../shared/feedback.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-feedback',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-feedback.component.html',
    styleUrl: './admin-feedback.component.scss'
})
export class AdminFeedbackComponent implements OnInit {
    private feedbackService = inject(FeedbackService);
    private router = inject(Router);

    stats: FeedbackStats | null = null;
    feedbacks: AppFeedback[] = [];
    loading = true;

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.feedbackService.getStats().subscribe({
            next: (res: any) => {
                // Backend might return { value: ... } or { data: ... }
                this.stats = res.data || res.value || res;

                this.feedbackService.getList().subscribe({
                    next: (resList: any) => {
                        const list = resList.data || resList.value || resList;
                        // Ensure it's an array
                        this.feedbacks = Array.isArray(list) ? list : [];
                        this.loading = false;
                    },
                    error: (err) => {
                        console.error('Error loading feedback list', err);
                        this.loading = false;
                    }
                });
            },
            error: (err) => {
                console.error('Error loading stats', err);
                this.loading = false;
            }
        });
    }

    getScoreLabel(score: any): string {
        // Backend Enum: Bad=1, Good=2, Great=3
        if (score === 1 || score === 'Bad') return 'Ruim 😞';
        if (score === 2 || score === 'Good') return 'Bom 😐';
        if (score === 3 || score === 'Great') return 'Ótimo 🤩';
        return '-';
    }

    getScoreClass(score: any): string {
        if (score === 1 || score === 'Bad') return 'bad';
        if (score === 2 || score === 'Good') return 'good';
        if (score === 3 || score === 'Great') return 'great';
        return '';
    }

    goBack() {
        this.router.navigate(['/admin']);
    }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService, MatchProfile } from '../../services/match.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';
import { Observable, combineLatest, map } from 'rxjs';
import { FeedbackService } from '../shared/feedback.service';
import { FeedbackCardComponent } from '../shared/feedback-card/feedback-card.component';

@Component({
    selector: 'app-actions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './actions.component.html',
    styleUrl: './actions.component.scss'
})
export class ActionsComponent implements OnInit {
    superLikes$: Observable<MatchProfile[]>;
    matches$: Observable<MatchProfile[]>;
    receivedLikes: MatchProfile[] = [];
    loadingLikes = true;
    showFeedback = false;

    private router = inject(Router);
    private matchService = inject(MatchService);
    private chatService = inject(ChatService);
    private authService = inject(AuthService);
    private feedService = inject(FeedService);
    private feedbackService = inject(FeedbackService);

    get isPremium(): boolean {
        const user = this.authService.currentUser();
        return user?.isPremium || false;
    }

    constructor() {
        this.superLikes$ = this.matchService.superLikes$;

        // Matches should only show those who are NOT in active conversations
        this.matches$ = combineLatest([
            this.matchService.matches$,
            this.chatService.chats$
        ]).pipe(
            map(([matches, chats]) => {
                const validChats = (chats || []).filter((c: any) => c.lastMessage && c.lastMessage.trim() !== '');
                const activeChatUserIds = new Set(validChats.map((c: any) => c.otherUserId));

                return (matches as MatchProfile[]).filter(m => !activeChatUserIds.has(m.id));
            })
        );
    }

    ngOnInit() {
        this.matchService.fetchSuperLikes().subscribe();
        this.matchService.fetchMatches().subscribe();
        this.fetchLikes();
    }

    fetchLikes() {
        this.matchService.receivedLikes$.subscribe(likes => {
            this.receivedLikes = likes;
            if (this.receivedLikes.length > 0) {
                this.loadingLikes = false;
            }
        });

        if (this.receivedLikes.length === 0) {
            // loading...
        } else {
            this.loadingLikes = false;
        }

        this.matchService.fetchReceivedLikes().subscribe({
            next: (likes) => {
                this.receivedLikes = likes;
                this.loadingLikes = false;
            },
            error: () => {
                this.loadingLikes = false;
            }
        });
    }

    handleSuperLikeClick(sl: MatchProfile) {
        if (!this.isPremium) return;

        // Mark as viewed immediately
        this.matchService.markAsViewed(sl.id, 'superlike');

        this.feedService.like(sl.id).subscribe({
            next: (response) => {
                if (response.isMatch && response.chatId) {
                    this.router.navigate(['chat', response.chatId], {
                        state: { name: sl.name, photo: sl.photo, superLikedBy: sl.id }
                    });
                } else {
                    this.router.navigate(['profile', sl.id]);
                }
            }
        });
    }

    handleLikeClick(like: MatchProfile) {
        if (!this.isPremium) return;

        this.matchService.markAsViewed(like.id, 'like');
        this.router.navigate(['profile', like.id]);
    }

    handleMatchClick(match: MatchProfile) {
        this.matchService.markAsViewed(match.id, 'match');

        if (match.chatId) {
            this.router.navigate(['chat', match.chatId], {
                state: { name: match.name, photo: match.photo }
            });
        } else {
            this.router.navigate(['profile', match.id]);
        }
    }

    goToPlans() {
        this.router.navigate(['/plans']);
    }
}

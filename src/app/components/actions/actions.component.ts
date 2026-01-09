import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService, MatchProfile } from '../../services/match.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';
import { Observable, combineLatest, map } from 'rxjs';
import { NavigationStateService } from '../../core/services/navigation-state.service';

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
    private navService = inject(NavigationStateService);

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
    // ... existing ngOnInit/fetchLikes ...

    // ... existing handlers ...

    goToPlans() {
        this.navService.allowPlansAccess();
        this.router.navigate(['/plans']);
    }

    ngOnInit() {
        this.matchService.fetchSuperLikes().subscribe();
        this.matchService.fetchMatches().subscribe();
        this.fetchLikes();
    }

    fetchLikes() {
        // Subscribe to cache/state primarily
        this.matchService.receivedLikes$.subscribe(likes => {
            this.receivedLikes = likes;
            // Trust the cache state immediately to avoid flickering skeletons
            this.loadingLikes = false;
        });
        this.matchService.fetchReceivedLikes().subscribe({
            next: (likes) => {
                // Subscription above handles the update
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
}

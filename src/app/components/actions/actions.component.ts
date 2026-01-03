import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatchService, MatchProfile } from '../../services/match.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';
import { Observable, combineLatest, map } from 'rxjs';

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

    private router = inject(Router);
    private matchService = inject(MatchService);
    private chatService = inject(ChatService);
    private authService = inject(AuthService);
    private feedService = inject(FeedService);

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

        // Initial load from cache checks
        // If we already have data in the service subject, don't show full loader
        // access the observable directly as we did, but also subscription.
        // Actually, let's just subscribe.
        this.fetchLikes();
    }

    fetchLikes() {
        // If we already have cached values in the service, we might not need to show the spinner 
        // strictly or we can assume it loads fast.
        // But user asked to "store status" or "not show loader if nothing changed".
        // The service logic I added earlier does clear cache on logout.
        // I can detect if the service's receivedLikesSubject has value? 
        // It's private in service but accessible via observable.
        // Let's rely on the property we already have. 

        // If we already have receivedLikes from a previous fetch (and component was not destroyed? no, component is destroyed on nav)
        // But the Service is Singleton.

        // BETTER: Use matchService.receivedLikes$ observable with 'startWith'?
        // The service uses BehaviorSubject, so it always emits last value on subscription.

        this.matchService.receivedLikes$.subscribe(likes => {
            this.receivedLikes = likes;
            // If we have likes (or empty array but confirmed fetched), stop loading.
            // Issue: Initial state of BehaviorSubject is []. 
            // how to differentiate "Not Fetched Yet" [] vs "Fetched and Empty" []?
            // Valid point. 
            // However, upon navigation, we can just start fetch.
            // If I set loadingLikes = false initially, then only set true if I really need to wait?
            // If I set loading to false, the template shows empty state immediately.

            // Simplest fix for "toda vez q eu clico aparece o load":
            // If likes.length > 0, definitely stop loading.
            if (this.receivedLikes.length > 0) {
                this.loadingLikes = false;
            }
        });

        // Trigger fetch in background.
        // Only set loading to TRUE if we really don't have anything?
        if (this.receivedLikes.length === 0) {
            // this.loadingLikes = true; // Don't force true if we want to avoid flickering?
            // User says "mesmo sem ter mudado nada".
            // If cache is empty, we must load.
        } else {
            // If we have data, don't show loader overlay.
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

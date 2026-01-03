import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

import { ChatService } from '../../../services/chat.service';
import { MatchService } from '../../../services/match.service';
import { ChatRealtimeService } from '../../../services/chat-realtime.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit, OnDestroy {
  activeTab: string = 'feed';
  private routerSubscription: Subscription | undefined;

  showDisabledTooltip = false;

  totalChatNotifications$: Observable<number>;
  totalActions$: Observable<number>;

  constructor(
    private router: Router,
    public authService: AuthService,
    private chatService: ChatService,
    private matchService: MatchService,
    private chatRealtimeService: ChatRealtimeService
  ) {
    // 1. Chat Notifications: ONLY Unread Chats (User Request: "quando for resposta de conversa")
    this.totalChatNotifications$ = this.chatService.totalUnread$;

    // 2. Actions Notifications: Super Likes + Received Likes + Matches (User Request: "matches tem q estar no raio")
    // Also: Only count Received Likes and Super Likes IF Premium.
    const user$ = toObservable(this.authService.currentUser);

    this.totalActions$ = combineLatest([
      this.matchService.superLikes$,
      this.matchService.receivedLikes$,
      this.matchService.matches$,
      this.chatService.chats$,
      user$
    ]).pipe(
      map(([superLikes, receivedLikes, matches, chats, user]) => {
        const isPremium = user?.isPremium || false;

        // Filter Matches: Only those NOT in active chats need to be counted here?
        const validChats = (chats || []).filter(c => c.lastMessage && c.lastMessage.trim() !== '');
        const activeChatUserIds = new Set(validChats.map(c => c.otherUserId));

        const newMatchesCount = matches.filter(m => {
          if (activeChatUserIds.has(m.id)) return false;
          if (!m.isNew) return false;
          return true;
        }).length;

        // Likes and SuperLikes checks
        const newSuperLikes = (superLikes || []).filter(s => s.isNew).length;
        const newReceivedLikes = (receivedLikes || []).filter(l => l.isNew).length;

        // Condition: If NOT premium, do NOT count likes/superlikes in the badge.
        const effectiveSuperLikes = isPremium ? newSuperLikes : 0;
        const effectiveReceivedLikes = isPremium ? newReceivedLikes : 0;

        return effectiveSuperLikes + effectiveReceivedLikes + newMatchesCount;
      })
    );
  }

  ngOnInit() {
    this.updateActiveTab(this.router.url);

    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });

    // Ensure real-time connection and data load
    this.chatRealtimeService.startConnection().catch(err => console.error('SignalR Init Error', err));
    this.matchService.fetchMatches().subscribe();
    this.chatService.loadChats().subscribe();
    this.matchService.fetchSuperLikes().subscribe();
    this.matchService.fetchReceivedLikes().subscribe();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes('/feed') || url.includes('/coming-soon')) {
      this.activeTab = 'feed';
    } else if (url.includes('/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/chat')) {
      this.activeTab = 'chat';
    } else if (url.includes('/settings')) {
      this.activeTab = 'settings';
    } else if (url.includes('/actions')) {
      this.activeTab = 'actions';
    }
  }

  navigateTo(tab: string) {
    if (tab === 'profile') {
      this.router.navigate(['/profile']);
    } else if (tab === 'feed') {
      const user = this.authService.currentUser();
      if (!this.authService.isProfileComplete(user)) {
        this.showDisabledTooltip = !this.showDisabledTooltip;
        return;
      }
      this.router.navigate(['/feed']);
    } else if (tab === 'chat') {
      this.router.navigate(['/chat']);
    } else if (tab === 'settings') {
      this.router.navigate(['/settings']);
    } else if (tab === 'actions') {
      this.router.navigate(['/actions']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showDisabledTooltip) {
      const target = event.target as HTMLElement;
      if (!target.closest('.feed-btn')) {
        this.showDisabledTooltip = false;
      }
    }
  }
}

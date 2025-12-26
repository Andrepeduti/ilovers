import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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

  totalNotifications$: Observable<number>;

  constructor(
    private router: Router,
    public authService: AuthService,
    private chatService: ChatService,
    private matchService: MatchService,
    private chatRealtimeService: ChatRealtimeService
  ) {
    // Initialize notification count
    this.totalNotifications$ = combineLatest([
      this.chatService.totalUnread$,
      this.matchService.totalNew$
    ]).pipe(
      map(([unreadChats, newMatches]) => unreadChats + newMatches)
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
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateActiveTab(url: string) {
    if (url.includes('/feed')) {
      this.activeTab = 'feed';
    } else if (url.includes('/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/chat')) {
      this.activeTab = 'chat';
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

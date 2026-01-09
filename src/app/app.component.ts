import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, Event } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/shared/footer/footer.component';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

import { AuthService } from './core/services/auth.service';
import { InteractionService } from './core/services/interaction.service';
import { MatchService } from './services/match.service';
import { ChatService } from './services/chat.service';
import { ChatRealtimeService } from './services/chat-realtime.service';
import { NotificationModalComponent } from './components/shared/notification-modal/notification-modal.component';
import { ScrollService } from './core/services/scroll.service';
import { LoaderService } from './core/services/loader.service';
import { LoaderComponent } from './components/shared/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, CommonModule, NotificationModalComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ILovers';
  showFooter = false;

  private loaderService = inject(LoaderService);
  isLoading = this.loaderService.loading;

  showNotificationModal = false;
  currentNotification: { fromUserName: string; fromUserPhoto: string | null; interactionId: string } | null = null;
  pendingNotifications: any[] = [];

  showDesktopBlocker = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private interactionService: InteractionService,
    private matchService: MatchService,
    private chatService: ChatService,
    private chatRealtimeHelper: ChatRealtimeService,
    private scrollService: ScrollService
  ) {
    //this.checkDeviceAndEnvironment();

    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Force scroll to top on navigation, with a small delay to ensure view update
      setTimeout(() => {
        this.scrollService.scrollToTop();
      }, 50);

      // Hide footer on login, register, and conversation detail pages
      this.showFooter = !event.urlAfterRedirects.includes('/login') &&
        !event.urlAfterRedirects.includes('/register') &&
        !event.urlAfterRedirects.includes('/chat/') &&
        !event.urlAfterRedirects.includes('/profile/') &&
        !event.urlAfterRedirects.includes('/plans');
    });

    // Restore user state on refresh
    if (this.authService.isAuthenticated()) {
      if (!this.authService.currentUser()) {
        this.authService.getProfile().subscribe({
          next: () => this.initializeApp(),
          error: () => this.authService.logout()
        });
      } else {
        this.initializeApp();
      }
    }
  }

  checkDeviceAndEnvironment() {
    // Only block if we are in PRODUCTION environment
    if (environment.production) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        this.showDesktopBlocker = true;
      }
    }
  }

  initializeApp() {
    this.checkNotifications();
    this.chatRealtimeHelper.startConnection();
    this.matchService.fetchMatches().subscribe();
    this.chatService.loadChats().subscribe();
  }

  checkNotifications() {
    this.interactionService.getPendingNotifications().subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.pendingNotifications = response.data;
          this.showNextNotification();
        }
      },
      error: (err) => console.error('Error fetching notifications', err)
    });
  }

  showNextNotification() {
    if (this.pendingNotifications.length > 0) {
      const next = this.pendingNotifications.shift();
      this.currentNotification = {
        fromUserName: next.fromUserName,
        fromUserPhoto: next.fromUserPhoto,
        interactionId: next.interactionId
      };
      this.showNotificationModal = true;
    } else {
      this.showNotificationModal = false;
      this.currentNotification = null;
    }
  }

  closeNotification() {
    if (this.currentNotification) {
      this.interactionService.markAsViewed(this.currentNotification.interactionId).subscribe();
    }
    this.showNextNotification();
  }
}

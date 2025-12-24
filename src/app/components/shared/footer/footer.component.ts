import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

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

  constructor(private router: Router, public authService: AuthService) { }

  ngOnInit() {
    this.updateActiveTab(this.router.url);

    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });
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

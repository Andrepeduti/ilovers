import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavigationStateService } from '../../core/services/navigation-state.service';
import { ChatRealtimeService } from '../../services/chat-realtime.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private navService = inject(NavigationStateService);
    private chatRealtimeService = inject(ChatRealtimeService);

    profile = this.authService.currentUser;

    showLogoutModal = false;
    showHelpModal = false;

    ngOnInit() {
        // Refresh profile to ensure premium status is up to date
        this.authService.getProfile().subscribe(response => {
            if (response && response.data) {
                this.authService.currentUser.set(response.data);
            }
        });
    }

    navigateToPlans() {
        this.navService.allowPlansAccess();
        this.router.navigate(['/plans'], { queryParams: { returnUrl: '/settings' } });
    }

    openHelpModal() {
        this.showHelpModal = true;
    }

    closeHelpModal() {
        this.showHelpModal = false;
    }

    logout() {
        this.showLogoutModal = true;
    }

    confirmLogout() {
        this.chatRealtimeService.stopConnection();
        this.authService.logout();
        this.showLogoutModal = false;
        this.router.navigate(['/login']);
    }

    cancelLogout() {
        this.showLogoutModal = false;
    }
}

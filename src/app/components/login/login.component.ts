import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  // Simple model for the form
  loginData = {
    email: '',
    password: ''
  };

  // Toggle password visibility
  showPassword = false;

  // Forgot Password Modal State
  showForgotModal = false;
  forgotEmail = '';
  resetSent = false;

  // Help Modal State
  showHelpModal = false;

  isLoading = false;
  loginError = '';

  constructor(
    private socialAuthService: SocialAuthService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    scroll(0, 0);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.isLoading = true;
    this.loginError = ''; // Reset error on new submission

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Token is stored by AuthService tap
        this.isLoading = false;
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;

        if (error.status === 401 && error.error?.error?.code === 'INVALID_CREDENTIALS') {
          this.loginError = 'E-mail ou senha incorretos.';
        } else {
          this.loginError = 'Ocorreu um erro ao entrar. Tente novamente.';
        }
      }
    });
  }

  isForgotLoading = false;

  // Forgot Password Logic
  openForgotModal() {
    this.showForgotModal = true;
    this.resetSent = false;
    this.forgotEmail = '';
    this.isForgotLoading = false;
  }

  closeForgotModal() {
    this.showForgotModal = false;
  }

  sendResetLink() {
    if (this.forgotEmail) {
      this.isForgotLoading = true;
      this.authService.forgotPassword(this.forgotEmail).subscribe({
        next: () => {
          this.resetSent = true;
          this.isForgotLoading = false;
        },
        error: (err) => {
          console.error(err);
          // show error? for security we might just show success anyway or generic error
          this.resetSent = true;
          this.isForgotLoading = false;
        }
      });
    }
  }

  // Help Modal Logic
  openHelpModal() {
    this.showHelpModal = true;
    this.showHelpModal = true;
  }

  closeHelpModal() {
    this.showHelpModal = false;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleSigninButtonModule],
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

  // Forgot Password Logic
  openForgotModal() {
    this.showForgotModal = true;
    this.resetSent = false;
    this.forgotEmail = '';
  }

  closeForgotModal() {
    this.showForgotModal = false;
  }

  sendResetLink() {
    if (this.forgotEmail) {
      console.log(`Sending reset link to: ${this.forgotEmail}`);
      // Simulate API call
      this.resetSent = true;
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

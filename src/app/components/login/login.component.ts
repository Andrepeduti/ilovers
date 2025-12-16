import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
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

  constructor(
    private authService: SocialAuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      console.log('User:', user);
      if (user) {
        this.router.navigate(['/profile']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login attempt:', this.loginData);
    this.router.navigate(['/profile']);
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
}

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

  constructor(
    private authService: SocialAuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.authState.subscribe((user) => {
      console.log('User:', user);
      if (user) {
        this.router.navigate(['/profile']);
        // console.log('Login successful (Redirection to Profile)');
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login attempt:', this.loginData);
    // Here you would implement actual login logic
    this.router.navigate(['/profile']); // Fallback for manual login for demo
    // console.log('Login attempt successful (Redirection to Profile)');
  }
}

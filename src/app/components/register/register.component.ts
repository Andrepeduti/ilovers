import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    email = '';
    confirmEmail = '';
    password = '';
    confirmPassword = '';
    bankId = '';
    termsAccepted = false;

    passwordVisible = false;
    confirmPasswordVisible = false;

    passwordRules = {
        minLength: false,
        upper: false,
        lower: false,
        special: false
    };

    isPasswordDirty = false;

    constructor(private router: Router) { }

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible;
    }

    toggleConfirmPasswordVisibility() {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }

    updatePasswordRules() {
        this.isPasswordDirty = true;
        const p = this.password;
        this.passwordRules.minLength = p.length >= 8;
        this.passwordRules.upper = /[A-Z]/.test(p);
        this.passwordRules.lower = /[a-z]/.test(p);
        this.passwordRules.special = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    }

    get isFormValid(): boolean {
        const emailsMatch = !!this.email && this.email === this.confirmEmail;
        const passwordsMatch = !!this.password && this.password === this.confirmPassword;
        const passwordValid = Object.values(this.passwordRules).every(r => r);
        const bankIdFilled = !!this.bankId;

        return emailsMatch && passwordsMatch && passwordValid && bankIdFilled && this.termsAccepted;
    }

    get passwordsMatch(): boolean {
        return !!this.password && this.password === this.confirmPassword;
    }

    get emailsMatch(): boolean {
        return !!this.email && this.email === this.confirmEmail;
    }

    get showEmailMismatchError(): boolean {
        return !!this.confirmEmail && this.email !== this.confirmEmail;
    }

    onCreateAccount() {
        if (this.isFormValid) {
            console.log('Account created for:', this.email, this.bankId);
            this.router.navigate(['/profile']);
        }
    }

    bankIdInvalid = false;

    onBankIdInput(event: Event) {
        const input = event.target as HTMLInputElement;

        // remove tudo que não for número
        let value = input.value.replace(/\D/g, '');

        // limita a 9 dígitos
        value = value.slice(0, 9);

        // atualiza input e model
        input.value = value;
        this.bankId = value;

        // valida se tem exatamente 9 números
        this.bankIdInvalid = value.length !== 9;
    }
}

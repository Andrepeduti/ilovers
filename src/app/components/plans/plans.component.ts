import { Component, OnInit, inject, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan, PlanService, ProcessPaymentRequest } from '../../core/services/plan.service';
import { ProfileService } from '../../core/services/profile.service';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../shared/loader/loader.component';

declare const MercadoPago: any;

@Component({
    selector: 'app-plans',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './plans.component.html',
    styleUrl: './plans.component.scss'
})
export class PlansComponent implements OnInit, OnDestroy {
    private planService = inject(PlanService);
    private profileService = inject(ProfileService);
    private router = inject(Router);
    private ngZone = inject(NgZone);
    private route = inject(ActivatedRoute);

    plans: Plan[] = [];
    isLoading = true;
    selectedPlan: Plan | null = null;
    mp: any;
    bricksBuilder: any;
    userEmail = '';
    isUserPremium = false;
    pixQrCodeBase64: string | null = null;
    pixQrCodeCopyPaste: string | null = null;
    isProcessingPayment = false;
    premiumExpiresAt: Date | null = null;
    showDowngradeModal = false;
    showSuccessModal = false;

    private returnUrl = '/profile';

    paymentMethodSelected: 'credit_card' | 'pix' | null = null;

    paymentPollingInterval: any;
    currentExternalPaymentId: string | null = null;

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.returnUrl = params['returnUrl'] || '/profile';
        });

        this.loadPlans();
        this.loadProfile();
        try {
            this.mp = new MercadoPago(environment.mercadoPagoPublicKey, {
                locale: 'pt-BR'
            });
            this.bricksBuilder = this.mp.bricks();
        } catch (e) {
            console.error('Error initializing MercadoPago', e);
        }
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    navigateToProfile() {
        this.router.navigate([this.returnUrl]);
    }

    closeSuccessModal() {
        this.showSuccessModal = false;
        window.location.href = this.returnUrl;
    }

    loadProfile() {
        this.profileService.getMyProfile().subscribe((response: any) => {
            const data = response.data || response;
            if (data && data.email) {
                this.userEmail = data.email;
            } else if (data && data.Email) {
                this.userEmail = data.Email;
            }
            this.isUserPremium = !!(data.isPremium || data.IsPremium);

            const expiresAt = data.premiumExpiresAt || data.PremiumExpiresAt;
            this.premiumExpiresAt = expiresAt ? new Date(expiresAt) : null;
        });
    }

    loadPlans() {
        this.isLoading = true;
        this.planService.getPlans().subscribe({
            next: (data) => {
                this.plans = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading plans', err);
                this.isLoading = false;
            }
        });
    }

    selectPlan(plan: Plan) {
        this.selectedPlan = plan;
    }

    cardPaymentBrickController: any;

    payWithCreditCard() {
        if (!this.selectedPlan) return;
        this.startPaymentProcess('credit_card');

        setTimeout(() => {
            this.setupBrick();
        }, 100);
    }

    async setupBrick() {
        console.log('Starting setupBrick. User Email:', this.userEmail);
        if (!this.bricksBuilder) {
            console.error('BricksBuilder not initialized');
            return;
        }

        const settings = {
            initialization: {
                amount: this.selectedPlan!.price,
                payer: {
                    email: this.userEmail,
                },
            },
            customization: {
                paymentMethods: {
                    creditCard: 'all',
                    mercadoPago: 'all',
                },
                visual: {
                    style: {
                        theme: 'default',
                    }
                }
            },
            callbacks: {
                onReady: () => {
                    console.log('Brick: onReady fired');
                },
                onError: (error: any) => {
                    console.error('Brick: onError fired', error);
                    alert('Erro no formulário de pagamento.');
                },
                onSubmit: (brickResponse: any) => {
                    console.log('Brick: onSubmit fired', brickResponse);
                    const cardFormData = brickResponse.formData;

                    return new Promise<void>((resolve, reject) => {
                        this.ngZone.run(() => {
                            console.log('Processing payment in NgZone...', cardFormData);

                            // Safe access and defaults
                            const request: ProcessPaymentRequest = {
                                planCode: this.selectedPlan!.code,
                                token: cardFormData.token,
                                paymentMethodId: cardFormData.payment_method_id, // Note: snake_case from MP
                                issuerId: cardFormData.issuer_id, // Note: snake_case from MP
                                payerEmail: cardFormData.payer.email,
                                identificationType: cardFormData.payer.identification.type,
                                identificationNumber: cardFormData.payer.identification.number,
                                amount: this.selectedPlan!.price,
                                description: `Assinatura ${this.selectedPlan!.name}`
                            };

                            this.planService.processPayment(request).subscribe({
                                next: (result) => {
                                    console.log('Payment Success:', result);
                                    if (result.status === 'approved' || result.status === 'authorized') {
                                        this.verifyPremiumStatus();
                                        resolve();
                                    } else {
                                        alert('Pagamento não aprovado: ' + (result.statusDetail || result.status));
                                        reject();
                                    }
                                },
                                error: (err) => {
                                    console.error('Payment API Error:', err);
                                    alert('Erro ao processar pagamento.');
                                    reject();
                                }
                            });
                        });
                    });
                },
            },
        };

        try {
            if (this.cardPaymentBrickController) {
                await this.cardPaymentBrickController.unmount();
            }
            this.cardPaymentBrickController = await this.bricksBuilder.create(
                'payment',
                'payment-brick-container',
                settings
            );
        } catch (e) {
            console.error('Error creating brick', e);
        }
    }

    async cancelPayment() {
        console.log('Cancelling payment...');
        if (this.cardPaymentBrickController) {
            try {
                // Race unmount with a 500ms timeout to prevent hanging
                const unmountPromise = this.cardPaymentBrickController.unmount();
                const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
                await Promise.race([unmountPromise, timeoutPromise]);
                console.log('Brick unmounted.');
            } catch (error) {
                console.warn('Error unmounting brick', error);
            }
            this.cardPaymentBrickController = null;
        }

        // Force UI update inside Angular Zone
        this.ngZone.run(() => {
            this.paymentMethodSelected = null;
            this.isProcessingPayment = false;
            console.log('Payment cancelled. State reset.');
        });
    }

    payWithPix() {
        if (!this.selectedPlan) return;
        this.startPaymentProcess('pix');

        const request: ProcessPaymentRequest = {
            planCode: this.selectedPlan.code,
            token: '',
            paymentMethodId: 'pix',
            issuerId: '',
            payerEmail: this.userEmail,
            identificationType: 'CPF',
            identificationNumber: '',
            amount: this.selectedPlan.price,
            description: `Pagamento Pix ${this.selectedPlan.name}`
        };

        this.executePayment(request);
    }

    startPaymentProcess(method: 'credit_card' | 'pix') {
        this.isProcessingPayment = true;
        this.paymentMethodSelected = method;
    }

    executePayment(request: ProcessPaymentRequest) {
        this.planService.processPayment(request).subscribe({
            next: (result) => {
                this.ngZone.run(() => {
                    this.isProcessingPayment = false;
                    this.paymentMethodSelected = null;

                    console.log('Payment Result:', result);

                    // 1. Redirect Flow (Credit Card)
                    if (result.ticketUrl) {
                        window.open(result.ticketUrl, '_blank');
                        return;
                    }

                    // 2. Pix Flow (QR Code)
                    if (result.qrCodeBase64 && result.qrCode) {
                        this.pixQrCodeBase64 = result.qrCodeBase64;
                        this.pixQrCodeCopyPaste = result.qrCode;
                        if (result.paymentId) {
                            this.startPolling(result.paymentId.toString());
                        }
                        return;
                    }

                    // 3. Approved Immediately (Rare for this flow)
                    if (result.status === 'approved') {
                        this.verifyPremiumStatus();
                        return;
                    }

                    // Fallback
                    alert('Status do pagamento: ' + (result.statusDetail || result.status));
                });
            },
            error: (error) => {
                this.ngZone.run(() => {
                    this.isProcessingPayment = false;
                    this.paymentMethodSelected = null;
                    console.error('Payment Error:', error);
                    alert('Erro ao iniciar pagamento. Tente novamente.');
                });
            }
        });
    }

    copyPixCode() {
        if (this.pixQrCodeCopyPaste) {
            navigator.clipboard.writeText(this.pixQrCodeCopyPaste).then(() => {
                alert('Código Pix copiado!');
            });
        }
    }

    startPolling(externalId: string) {
        this.stopPolling();
        this.currentExternalPaymentId = externalId;

        this.paymentPollingInterval = setInterval(() => {
            if (!this.currentExternalPaymentId) return;

            this.planService.getPaymentStatus(this.currentExternalPaymentId).subscribe({
                next: (result) => {
                    if (result.status === 'approved') {
                        this.stopPolling();
                        this.showSuccessModal = true;
                        this.clearSelection();
                        this.loadProfile();
                    }
                },
                error: (err) => console.error('Polling error', err)
            });
        }, 5000);
    }

    stopPolling() {
        if (this.paymentPollingInterval) {
            clearInterval(this.paymentPollingInterval);
            this.paymentPollingInterval = null;
        }
        this.currentExternalPaymentId = null;
    }

    clearSelection() {
        this.stopPolling();
        this.selectedPlan = null;
        this.pixQrCodeBase64 = null;
        this.pixQrCodeCopyPaste = null;
    }

    checkSubscriptionStatus() {
        this.isLoading = true;
        this.planService.syncSubscription().subscribe({
            next: () => {
                this.isLoading = false;
                this.verifyPremiumStatus();
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
                alert('Nenhuma assinatura ativa encontrada para seu e-mail.');
            }
        });
    }

    verifyPremiumStatus(attempt = 1) {
        if (attempt === 1) this.isLoading = true;

        this.profileService.getMyProfile().subscribe({
            next: (response: any) => {
                const data = response.data || response;
                if (data && (data.isPremium || data.IsPremium)) {
                    this.showSuccessModal = true;
                    this.selectedPlan = null;
                    this.isLoading = false;
                } else {
                    if (attempt < 10) {
                        setTimeout(() => this.verifyPremiumStatus(attempt + 1), 1000);
                    } else {
                        // Give up but assume it might work later or user needs to refresh
                        this.showSuccessModal = true;
                        this.selectedPlan = null;
                        this.isLoading = false;
                    }
                }
            },
            error: () => {
                if (attempt < 5) setTimeout(() => this.verifyPremiumStatus(attempt + 1), 1000);
                else this.isLoading = false;
            }
        });
    }

    openDowngradeModal() {
        this.showDowngradeModal = true;
    }

    closeDowngradeModal() {
        this.showDowngradeModal = false;
    }
}

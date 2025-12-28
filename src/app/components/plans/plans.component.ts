import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Plan, PlanService, ProcessPaymentRequest } from '../../core/services/plan.service';
import { ProfileService } from '../../core/services/profile.service';

declare const MercadoPago: any;

import { Router, ActivatedRoute } from '@angular/router';

import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
    selector: 'app-plans',
    standalone: true,
    imports: [CommonModule, LoaderComponent],
    templateUrl: './plans.component.html',
    styleUrl: './plans.component.scss'
})
export class PlansComponent implements OnInit {
    private planService = inject(PlanService);
    private profileService = inject(ProfileService);
    private router = inject(Router);

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

    private route = inject(ActivatedRoute); // Inject ActivatedRoute
    private returnUrl = '/profile'; // Default

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.returnUrl = params['returnUrl'] || '/profile';
        });

        this.loadPlans();
        this.loadProfile();
        // Initialize Mercado Pago instance with Public Key
        this.mp = new MercadoPago('TEST-12d330bf-6495-4378-85ad-4b4583a83a69', {
            locale: 'pt-BR'
        });
        this.bricksBuilder = this.mp.bricks();
    }

    navigateToProfile() {
        // Renamed to 'goBack' effectively, but keeping name for compatibility with HTML if used there
        this.router.navigate([this.returnUrl]);
    }

    // ... (rest of code)

    closeSuccessModal() {
        this.showSuccessModal = false;
        // Navigate instead of hard refresh if possible, or keep hard refresh if needed for state sync
        // Using window.location.href forces reload which might be good for updating user state globally
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
        setTimeout(() => this.createPaymentBrick(plan), 100); // Wait for DOM
    }

    async createPaymentBrick(plan: Plan) {
        const settings = {
            initialization: {
                amount: plan.price,
                payer: {
                    email: this.userEmail || 'test_user@test.com',
                },
            },
            customization: {
                paymentMethods: {
                    creditCard: 'all',
                    bankTransfer: 'all',
                    maxInstallments: 1,
                    minInstallments: 1
                },
                visual: {
                    hideValueProp: true,
                    style: {
                        theme: 'default', // Light theme for white background
                        customVariables: {
                            formBackgroundColor: '#ffffff',
                            baseColor: '#E63E98', // ILovers Pink
                            paymentMethodBackgroundColor: '#f5f5f5' // Light grey for inputs
                        }
                    },
                    texts: {
                        installmentsSectionTitle: ' ',
                        cardPaymentExperience: ' ',
                        total: 'Assinatura Mensal',
                    }
                }
            },
            callbacks: {
                onReady: () => {
                    // console.log('Brick ready');
                },
                onSubmit: async (cardFormData: any) => {
                    console.log('onSubmit triggered', cardFormData);
                    this.isProcessingPayment = true; // Start Loading

                    return new Promise<void>((resolve, reject) => {
                        try {
                            const mpMethodId = cardFormData.paymentMethodId || (cardFormData.payment_method_id) || 'pix';

                            const request: ProcessPaymentRequest = {
                                planCode: plan.code,
                                token: cardFormData.token, // Optional for Pix
                                paymentMethodId: mpMethodId,
                                issuerId: cardFormData.issuerId,
                                payerEmail: cardFormData.payer?.email || this.userEmail,
                                identificationType: cardFormData.payer?.identification?.type || 'CPF',
                                identificationNumber: cardFormData.payer?.identification?.number || '48164263885', // Fallback Test CPF
                                amount: plan.price,
                                description: `Assinatura ${plan.name}`
                            };

                            console.log('Sending Payment Request:', request);

                            this.planService.processPayment(request).subscribe({
                                next: (result) => {
                                    this.isProcessingPayment = false; // Stop Loading
                                    console.log('Payment Result:', result);
                                    if (result.status === 'approved') {
                                        this.verifyPremiumStatus();
                                        resolve();
                                    } else if (result.qrCodeBase64 && result.qrCode) {
                                        // Pix Flow
                                        this.pixQrCodeBase64 = result.qrCodeBase64;
                                        this.pixQrCodeCopyPaste = result.qrCode;
                                        if (result.paymentId) {
                                            this.startPolling(result.paymentId.toString());
                                        }
                                        resolve();
                                    } else {
                                        alert('Pagamento pendente ou rejeitado.');
                                        resolve();
                                    }
                                },
                                error: (error) => {
                                    this.isProcessingPayment = false; // Stop Loading
                                    console.error('API Error:', error);
                                    alert('Erro ao processar pagamento. Verifique o console.');
                                    reject();
                                }
                            });
                        } catch (e) {
                            console.error('JS Error in onSubmit:', e);
                            reject();
                        }
                    });
                },
                onError: (error: any) => {
                    console.error(error);
                },
            },
        };

        this.paymentBrickController = await this.bricksBuilder.create(
            'payment',
            'paymentBrick_container',
            settings
        );
    }

    copyPixCode() {
        if (this.pixQrCodeCopyPaste) {
            navigator.clipboard.writeText(this.pixQrCodeCopyPaste).then(() => {
                alert('Código Pix copiado!');
            });
        }
    }

    paymentPollingInterval: any;
    currentExternalPaymentId: string | null = null;

    ngOnDestroy() {
        this.stopPolling();
    }

    showSuccessModal = false;
    private paymentBrickController: any;

    startPolling(externalId: string) {
        this.stopPolling(); // Clear existing
        this.currentExternalPaymentId = externalId;

        console.log('Starting polling for payment:', externalId);

        this.paymentPollingInterval = setInterval(() => {
            if (!this.currentExternalPaymentId) return;

            this.planService.getPaymentStatus(this.currentExternalPaymentId).subscribe({
                next: (result) => {
                    console.log('Polling status:', result.status);
                    if (result.status === 'approved') {
                        this.stopPolling();
                        this.showSuccessModal = true;
                        this.clearSelection();
                        // Refresh profile to update badges or logic
                        this.loadProfile();
                    }
                },
                error: (err) => console.error('Polling error', err)
            });
        }, 5000); // Poll every 5 seconds
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

        if (this.paymentBrickController) {
            this.paymentBrickController.unmount();
            this.paymentBrickController = null;
        }

        this.selectedPlan = null;
        this.pixQrCodeBase64 = null;
        this.pixQrCodeCopyPaste = null;
        const container = document.getElementById('paymentBrick_container');
        if (container) container.innerHTML = '';
    }

    verifyPremiumStatus(attempt = 1) {
        // Show loading state if needed, or simple toast
        if (attempt === 1) this.isLoading = true;

        this.profileService.getMyProfile().subscribe({
            next: (response: any) => {
                const data = response.data || response;
                if (data && (data.isPremium || data.IsPremium)) {
                    this.showSuccessModal = true;
                    this.selectedPlan = null;
                } else {
                    if (attempt < 10) {
                        // Retry after 1s
                        setTimeout(() => this.verifyPremiumStatus(attempt + 1), 1000);
                    } else {
                        // Give up but still notify success of payment, maybe delay is huge
                        this.showSuccessModal = true;
                        this.selectedPlan = null;
                    }
                }
            },
            error: () => {
                if (attempt < 5) setTimeout(() => this.verifyPremiumStatus(attempt + 1), 1000);
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

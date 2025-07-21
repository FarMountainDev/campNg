import {inject, Injectable, signal, effect} from '@angular/core';
import {
  ConfirmationToken,
  loadStripe,
  Stripe,
  StripeElements,
  StripePaymentElement
} from '@stripe/stripe-js';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {CartService} from './cart.service';
import {Cart} from '../../shared/models/shoppingCart';
import {firstValueFrom, map} from 'rxjs';
import {ThemeService} from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);
  private readonly themeService = inject(ThemeService);
  private readonly stripePromise: Promise<Stripe | null>;
  private readonly paymentElementsReady = signal<boolean>(false);
  private elements?: StripeElements;
  private paymentElement?: StripePaymentElement;
  private elementsPromise?: Promise<StripeElements>;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
    effect(() => {
      const currentTheme = this.themeService.currentTheme() === 'dark' ? 'night' : 'stripe';
      if (this.paymentElementsReady() && this.elements) {
        void this.updatePaymentElementTheme(currentTheme);
      }
    });
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  disposeElements() {
    this.elements = undefined;
    this.paymentElement = undefined;
    this.elementsPromise = undefined;
    this.paymentElementsReady.set(false);
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');
    return this.http.post<Cart>(this.baseUrl + 'payments/' + cart.id, {}).pipe(
      map((cart: Cart) => {
        this.cartService.setCart(cart);
        return cart;
      })
    );
  }

  async initializeElements() {
    if (this.elementsPromise) {
      return this.elementsPromise;
    }
    if (this.elements) {
      return this.elements;
    }
    this.elementsPromise = this.initializeElementsPromise();

    try {
      this.elements = await this.elementsPromise;
      return this.elements;
    } catch (error) {
      this.elementsPromise = undefined;
      throw error;
    }
  }

  private async initializeElementsPromise(): Promise<StripeElements> {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe has not been loaded');
    }
    const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
    if (!cart.clientSecret) {
      throw new Error('Failed to get client secret from payment intent');
    }
    const theme = this.themeService.currentTheme() === 'dark' ? 'night' : 'stripe';
    return stripe.elements({
      clientSecret: cart.clientSecret,
      appearance: { theme, labels: 'floating' }
    });
  }

  async createPaymentElement() {
    if (this.paymentElement && this.paymentElementsReady()) {
      return this.paymentElement;
    }
    try {
      const elements = await this.initializeElements();
      if (!this.paymentElement) {
        this.paymentElement = elements.create('payment');
      }
      this.paymentElementsReady.set(true);
      return this.paymentElement;
    } catch (error) {
      this.paymentElementsReady.set(false);
      throw new Error(`Failed to create payment element: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe has not been loaded');
    }

    const elements = await this.initializeElements();
    const result = await elements.submit();

    if (result.error) {
      throw new Error(`Form submission failed: ${result.error.message}`);
    }

    return await stripe.createConfirmationToken({ elements });
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe has not been loaded');
    }

    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) {
      throw new Error(`Form submission failed: ${result.error.message}`);
    }

    const clientSecret = this.cartService.cart()?.clientSecret;
    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confirmationToken.id
        },
        redirect: 'if_required'
      })
    } else {
      throw new Error('Stripe has not been loaded');
    }
  }

  async updatePaymentElementTheme(theme: 'night' | 'stripe') {
    if (!this.paymentElementsReady() || !this.elements) {
      console.warn('Cannot update theme: payment elements not ready');
      return;
    }
    try {
      this.elements.update({
        appearance: { theme, labels: 'floating' }
      });
    } catch (error) {
      console.error('Failed to update payment element theme:', error);
    }
  }
}

import {inject, Injectable, signal} from '@angular/core';
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

class StripeServiceError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'StripeServiceError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private readonly baseUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);
  private readonly themeService = inject(ThemeService);
  private readonly stripePromise: Promise<Stripe | null>;
  private readonly paymentElementsReady = signal(false);
  private elements?: StripeElements;
  private paymentElement?: StripePaymentElement;
  private elementsPromise: Promise<StripeElements | undefined> | null = null;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
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

  disposeElements() {
    this.elements = undefined;
    this.paymentElement = undefined;
    this.paymentElementsReady.set(false);
  }

  async initializeElements() {
    if (this.elements) return this.elements;

    if (!this.elementsPromise) {
      this.elementsPromise = this.initializeElementsInternal().finally(() => {
        this.elementsPromise = null; // Reset promise to allow re-initialization
      });
    }

    return this.elementsPromise;
  }

  async createPaymentElement() {
    if (this.paymentElement) return this.paymentElement;

    try {
      const elements = await this.initializeElements();
      if (!elements) {
        throw new StripeServiceError('Stripe elements have not been initialized');
      }
      this.paymentElement = elements.create('payment');
      this.paymentElementsReady.set(true);
      return this.paymentElement;
      } catch (error) {
        console.error('Error creating payment element:', error);
        throw new StripeServiceError(
          `Failed to create payment element: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    if (!elements) {
      throw new StripeServiceError('Stripe elements have not been initialized');
    }
    const result = await elements.submit();
    if (result.error) {
      throw new StripeServiceError(
        result.error.message || 'Unknown Stripe error',
        result.error.code
      );
    }
    if (!stripe) {
      throw new StripeServiceError('Stripe has not been loaded');
    }
    return await stripe.createConfirmationToken({elements});
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    if (!elements) {
      throw new StripeServiceError('Stripe elements have not been initialized');
    }
    const result = await elements.submit();
    if (result.error) {
      throw new StripeServiceError(
        result.error.message || 'Unknown Stripe error',
        result.error.code
      );
    }
    const clientSecret = this.cartService.cart()?.clientSecret;
    if (!stripe || !clientSecret) {
      throw new StripeServiceError('Missing required payment configuration');
    }
    return await stripe.confirmPayment({
      clientSecret,
      confirmParams: {
        confirmation_token: confirmationToken.id
      },
      redirect: 'if_required'
    });
  }

  async updatePaymentElementTheme() {
    if (!this.paymentElement || !this.elements) return;

    const theme = this.themeService.currentTheme() === 'dark' ? 'night' : 'stripe';
    this.elements.update({
      appearance: {theme, labels: 'floating'}
    });
  }

  private async initializeElementsInternal() {
    const stripe = await this.getStripeInstance();
    if (!stripe) {
      throw new StripeServiceError('Stripe has not been loaded');
    }
    try {
      const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
      const theme = this.themeService.currentTheme() === 'dark' ? 'night' : 'stripe';
      this.elements = stripe.elements({
        clientSecret: cart.clientSecret,
        appearance: {theme, labels: 'floating'}
      });
      return this.elements;
    } catch (error) {
      console.error('Error initializing Stripe elements:', error);
      throw new StripeServiceError(
        `Failed to initialize Stripe elements: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

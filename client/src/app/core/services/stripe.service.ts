import {inject, Injectable} from '@angular/core';
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
  private elements?: StripeElements;
  private paymentElement?: StripePaymentElement;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();
      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        const theme = this.themeService.currentTheme() === 'dark' ? 'night' : 'stripe';
        this.elements = stripe.elements(
          {clientSecret: cart.clientSecret, appearance: {theme: theme, labels: 'floating'}});
      } else {
        throw new Error('Stripe has not been loaded');
      }
    }
    return this.elements;
  }

  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.initializeElements();
      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Stripe elements have not been initialized');
      }
    }
    return this.paymentElement;
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

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);
    if (stripe) {
      return await stripe.createConfirmationToken({elements});
    } else {
      throw new Error('Stripe has not been loaded');
    }
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);

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

  disposeElements() {
    this.elements = undefined;
    this.paymentElement = undefined;
  }
}

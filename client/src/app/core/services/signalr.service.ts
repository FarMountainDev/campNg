import {Injectable, signal} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HubConnection, HubConnectionBuilder, HubConnectionState} from '@microsoft/signalr';
import {Order} from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private readonly hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  orderSignal = signal<Order | null>(null);
  connectionState = signal<HubConnectionState | null>(null);

  isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  async ensureConnection(): Promise<boolean> {
    if (this.isConnected()) return true;

    try {
      await this.createHubConnection();
      return this.isConnected();
    } catch (error) {
      console.error('Failed to establish SignalR connection:', error);
      return false;
    }
  }

  async createHubConnection(retryCount: number = 0): Promise<void> {
    const maxRetries = 3;

    if (this.hubConnection?.state === HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnecting(() => {
      this.connectionState.set(HubConnectionState.Reconnecting);
      console.log('SignalR Hub Connection is reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.set(HubConnectionState.Connected);
      console.log('SignalR Hub Connection re-established');
    });

    this.hubConnection.onclose(() => {
      this.connectionState.set(HubConnectionState.Disconnected);
      console.log('SignalR Hub Connection closed');
    });

    try {
      await this.hubConnection.start();
      this.connectionState.set(HubConnectionState.Connected);
      console.log('SignalR Hub Connection started');
    } catch (err) {
      this.connectionState.set(HubConnectionState.Disconnected);
      console.error(`SignalR connection attempt ${retryCount + 1} failed:`, err);

      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.createHubConnection(retryCount + 1);
      }

      throw err;
    }

    this.hubConnection.on('OrderCompleteNotification', (order: Order) => {
      console.log('Order complete notification received:', order);
      this.orderSignal.set(order);
    });
  }

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop()
        .then(() => console.log('SignalR Hub Connection stopped'))
        .catch(err => console.error(err));
    }
  }

  resetConnection() {
    this.orderSignal.set(null);
    this.connectionState.set(null);
    this.hubConnection = undefined;
  }
}

﻿import {Injectable, signal} from '@angular/core';
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

  createHubConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR Hub Connection started'))
      .catch(err => console.error('Error while starting SignalR Hub Connection: ', err));

    this.hubConnection.on('OrderCompleteNotification', (order: Order) => {
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
}

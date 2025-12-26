import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { environment } from '../../environments/environment';

export interface ChatMessageDto {
    id: string;
    chatId: string;
    senderUserId: string;
    content: string;
    createdAt: string;
    isRead: boolean;
}

export interface MessageAckDto {
    tempId: string;
    realId: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatRealtimeService {
    private hubConnection: HubConnection | null = null;
    private messageReceivedSubject = new Subject<ChatMessageDto>();
    public messageReceived$ = this.messageReceivedSubject.asObservable();

    private messageAckSubject = new Subject<MessageAckDto>();
    public messageAck$ = this.messageAckSubject.asObservable();

    private matchReceivedSubject = new Subject<any>();
    public matchReceived$ = this.matchReceivedSubject.asObservable();

    private connectionStatusSubject = new BehaviorSubject<HubConnectionState>(HubConnectionState.Disconnected);
    public connectionStatus$ = this.connectionStatusSubject.asObservable();

    private authService = inject(AuthService);

    constructor() {
        // Start connection logic could be here or triggered manually
    }

    public async startConnection(): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) return;

        const token = this.authService.getToken();
        if (!token) return;

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${environment.apiUrl.replace('/api/v1', '')}/chatHub`, {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Warning)
            .build();

        this.hubConnection.on('ReceiveMessage', (message: ChatMessageDto) => {
            this.messageReceivedSubject.next(message);
        });

        this.hubConnection.on('MessageSentAck', (ack: MessageAckDto) => {
            this.messageAckSubject.next(ack);
        });

        this.hubConnection.on('ReceiveMatch', (payload: any) => {
            this.matchReceivedSubject.next(payload);
        });

        this.hubConnection.onreconnecting(() => this.connectionStatusSubject.next(HubConnectionState.Reconnecting));
        this.hubConnection.onreconnected(() => this.connectionStatusSubject.next(HubConnectionState.Connected));
        this.hubConnection.onclose(() => this.connectionStatusSubject.next(HubConnectionState.Disconnected));

        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');
            this.connectionStatusSubject.next(HubConnectionState.Connected);
        } catch (err) {
            console.error('SignalR Connection Error', err);
            // Retry logic usually handled by automaticReconnect AFTER first successful connection.
            // Initial failure needs manual retry or global handler.
        }
    }

    public async stopConnection(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            this.connectionStatusSubject.next(HubConnectionState.Disconnected);
        }
    }

    public async joinChat(chatId: string): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            await this.hubConnection.invoke('JoinChat', chatId);
        }
    }

    public async leaveChat(chatId: string): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            await this.hubConnection.invoke('LeaveChat', chatId);
        }
    }

    public async sendMessage(chatId: string, content: string, tempId: string): Promise<void> {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            await this.hubConnection.invoke('SendMessage', chatId, content, tempId);
        } else {
            throw new Error('SignalR not connected');
        }
    }
}

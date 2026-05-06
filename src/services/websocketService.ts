import * as signalR from '@microsoft/signalr';
import type { Medicion } from '../types';

export type ConnectionStatus = 'conectando' | 'conectado' | 'desconectado' | 'error';

type MessageCallback = (mediciones: Medicion[]) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: MessageCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private _status: ConnectionStatus = 'desconectado';

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  async start(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.setStatus('conectando');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://fired.runasp.net/ws', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Assign before setting up handlers so stop() can clear it
    this.connection = connection;

    connection.on('SensorPollings', (mediciones: Medicion[]) => {
      this.messageCallbacks.forEach((cb) => cb(mediciones));
    });

    connection.onreconnecting(() => {
      console.log('[WebSocket] Reconectando...');
      this.setStatus('conectando');
    });

    connection.onreconnected(() => {
      console.log('[WebSocket] Reconectado');
      this.setStatus('conectado');
    });

    connection.onclose(() => {
      console.log('[WebSocket] Conexión cerrada');
      // Only clear if this is still the active connection
      if (this.connection === connection) {
        this.setStatus('desconectado');
        this.connection = null;
      }
    });

    try {
      await connection.start();

      // Check if stop() was called while we were awaiting
      if (this.connection !== connection) {
        console.log('[WebSocket] Conexión cancelada durante el inicio (StrictMode)');
        await connection.stop().catch(() => {});
        return;
      }

      console.log('[WebSocket] Conectado a https://fired.runasp.net/ws');
      this.setStatus('conectado');
    } catch (err) {
      // Only set error if this is still the active connection
      if (this.connection === connection) {
        console.error('[WebSocket] Error al conectar:', err);
        this.setStatus('error');
        this.connection = null;
      }
    }
  }

  async stop(): Promise<void> {
    const connection = this.connection;
    // Clear reference first so start() can detect the cancellation
    this.connection = null;
    if (connection) {
      this.setStatus('desconectado');
      await connection.stop().catch(() => {});
    }
  }

  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback);
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback);
    };
  }
}

// Singleton
export const websocketService = new WebSocketService();

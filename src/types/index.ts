export interface User {
  email: string;
  name?: string;
}

export interface Celda {
  id: number;
  nombre: string;
  timestamp: string;
  activa: boolean;
  sensores: Sensor[];
  ubicacion: {
    lat: number;
    lng: number;
  };
}

export interface Sensor {
  id: number;
  temperatura: number;
  enFuego: boolean;
  tipo: 'temperatura' | 'fuego';
}

export interface DashboardStats {
  celdasActivas: number;
  celdasTotales: number;
  posiblesIncendios: number;
  sensoresEnAlerta: number;
  temperaturaPromedio: number;
  umbralTemperatura: number;
}

export interface TemperatureReading {
  timestamp: string;
  [key: string]: string | number;
}

export interface Medicion {
  sensorHardwareRouteId: number | null;
  pollingValue: string;
  dateTime: string;
  sensorId: number | null;
}

export type TimeRange = 'year' | 'month' | 'week' | 'day';

export interface Config {
  umbrales: {
    temperatura: number;
    intervaloMedicion: number;
  };
  notificaciones: {
    email: boolean;
    emailDireccion: string;
    whatsapp: boolean;
    sms: boolean;
    telefono: string;
  };
}
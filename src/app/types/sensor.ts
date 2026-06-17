export interface Sensor {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  temperature: number;
  status: 'active' | 'inactive' | 'alert';
  color: string;
  lastUpdate: Date;
}

export interface SensorReading {
  sensorId: string;
  temperature: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'temperature' | 'predictive';
  message: string;
  temperature: number;
  timestamp: Date;
  status: 'active' | 'resolved';
}

export interface NotificationConfig {
  email: boolean;
  emailAddress: string;
  sms: boolean;
  smsNumber: string;
}

export interface SystemConfig {
  temperatureThreshold: number;
  measurementInterval: number;
  notifications: NotificationConfig;
}

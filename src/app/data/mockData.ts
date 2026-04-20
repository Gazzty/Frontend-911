import { Sensor, SensorReading, Alert, SystemConfig } from '../types/sensor';

// Mock sensors en la región de Patagonia
export const mockSensors: Sensor[] = [
  {
    id: 'sensor-1',
    name: 'Sensor Bariloche Norte',
    location: { lat: -41.1335, lng: -71.3103 },
    temperature: 22,
    status: 'active',
    color: '#22c55e',
    lastUpdate: new Date(),
  },
  {
    id: 'sensor-2',
    name: 'Sensor Lago Nahuel Huapi',
    location: { lat: -41.1456, lng: -71.4089 },
    temperature: 35,
    status: 'active',
    color: '#eab308',
    lastUpdate: new Date(),
  },
  {
    id: 'sensor-3',
    name: 'Sensor Cerro Catedral',
    location: { lat: -41.1753, lng: -71.4544 },
    temperature: 68,
    status: 'alert',
    color: '#ef4444',
    lastUpdate: new Date(),
  },
  {
    id: 'sensor-4',
    name: 'Sensor Villa La Angostura',
    location: { lat: -40.7641, lng: -71.6643 },
    temperature: 28,
    status: 'active',
    color: '#22c55e',
    lastUpdate: new Date(),
  },
  {
    id: 'sensor-5',
    name: 'Sensor El Bolsón',
    location: { lat: -41.9627, lng: -71.5322 },
    temperature: 42,
    status: 'active',
    color: '#f97316',
    lastUpdate: new Date(),
  },
];

// Generar lecturas históricas para gráficos
export const generateMockReadings = (sensorId: string, days: number = 7): SensorReading[] => {
  const readings: SensorReading[] = [];
  const now = new Date();

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseTemp = 20 + Math.random() * 30;
    const variation = Math.sin(i / 12) * 10;

    readings.push({
      sensorId,
      temperature: Math.max(15, Math.min(75, baseTemp + variation)),
      timestamp,
    });
  }

  return readings;
};

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    sensorId: 'sensor-3',
    sensorName: 'Sensor Cerro Catedral',
    type: 'temperature',
    message: 'Temperatura crítica detectada: 68°C',
    temperature: 68,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'alert-2',
    sensorId: 'sensor-5',
    sensorName: 'Sensor El Bolsón',
    type: 'predictive',
    message: 'Condiciones previas a incendio detectadas',
    temperature: 42,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'active',
  },
  {
    id: 'alert-3',
    sensorId: 'sensor-2',
    sensorName: 'Sensor Lago Nahuel Huapi',
    type: 'temperature',
    message: 'Temperatura elevada: 55°C',
    temperature: 55,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'resolved',
  },
];

export const defaultConfig: SystemConfig = {
  temperatureThreshold: 50,
  measurementInterval: 60,
  notifications: {
    email: true,
    emailAddress: 'alertas@sistema-incendios.com',
    whatsapp: false,
    whatsappNumber: '',
    sms: false,
    smsNumber: '',
  },
};

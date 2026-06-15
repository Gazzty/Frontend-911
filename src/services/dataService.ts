import type { Celda, DashboardStats, TemperatureReading, Config, TimeRange } from '../types';
import { getAllSettings, updateSetting } from '../api/settingsApi';
import { getCellsFull, type Cell } from '../api/cellApi';
import { getSensorPollingsByDate } from '../api/sensorApi';

const SETTING_CODES = {
  TEMPERATURA_UMBRAL: 'TempMax',
  INTERVALO_MEDICION: 'IntervalPollingDefault',
  NOTIF_EMAIL: 'EmailsNotification',
  NOTIF_EMAIL_DIRECCION: 'Emails',
  NOTIF_WHATSAPP: 'WhatsappNotification',
  NOTIF_SMS: 'SMSNotification',
  NOTIF_TELEFONO: 'PhoneNumber',
} as const;

const DEFAULT_CONFIG: Config = {
  umbrales: {
    temperatura: 50,
    intervaloMedicion: 10,
  },
  notificaciones: {
    email: false,
    emailDireccion: '',
    whatsapp: false,
    sms: false,
    telefono: '',
  },
};

const cellToCelda = (cell: Cell): Celda => ({
  id: cell.id,
  nombre: cell.description,
  timestamp: '--:--:--',
  activa: cell.active,
  sensores: (cell.sensors ?? [])
    .filter((s) => s.active)
    .map((s) => ({
      id: s.id ?? 0,
      temperatura: 0,
      enFuego: false,
      tipo: s.type?.id === 2 ? 'fuego' : 'temperatura',
    })),
  ubicacion: {
    lat: parseFloat(cell.latitude),
    lng: parseFloat(cell.longitude),
  },
});

const generateMockCeldas = (): Celda[] => {
  return [
    {
      id: 1,
      nombre: 'Celda Bariloche Norte',
      timestamp: '11:29:32',
      activa: true,
      sensores: [
        { id: 1, temperatura: 22, enFuego: false },
        { id: 2, temperatura: 19, enFuego: false },
        { id: 3, temperatura: 24, enFuego: false },
        { id: 4, temperatura: 21, enFuego: false },
      ],
      ubicacion: { lat: -41.1335, lng: -71.3103 },
    },
    {
      id: 2,
      nombre: 'Celda Ushuaia Centro',
      timestamp: '11:25:10',
      activa: true,
      sensores: [
        { id: 1, temperatura: 45, enFuego: false },
        { id: 2, temperatura: 52, enFuego: true },
        { id: 3, temperatura: 38, enFuego: false },
        { id: 4, temperatura: 41, enFuego: false },
      ],
      ubicacion: { lat: -54.8019, lng: -68.3029 },
    },
    {
      id: 3,
      nombre: 'Celda El Bolsón Sur',
      timestamp: '11:20:45',
      activa: true,
      sensores: [
        { id: 1, temperatura: 55, enFuego: true },
        { id: 2, temperatura: 48, enFuego: false },
        { id: 3, temperatura: 50, enFuego: false },
        { id: 4, temperatura: 46, enFuego: false },
      ],
      ubicacion: { lat: -41.9628, lng: -71.5339 },
    },
    {
      id: 4,
      nombre: 'Celda Villa La Angostura',
      timestamp: '11:18:03',
      activa: false,
      sensores: [
        { id: 1, temperatura: 60, enFuego: true },
        { id: 2, temperatura: 58, enFuego: true },
        { id: 3, temperatura: 55, enFuego: true },
        { id: 4, temperatura: 52, enFuego: true },
      ],
      ubicacion: { lat: -40.7621, lng: -71.6644 },
    },
    {
      id: 5,
      nombre: 'Celda San Martín de los Andes',
      timestamp: '11:15:22',
      activa: true,
      sensores: [
        { id: 1, temperatura: 18, enFuego: false },
        { id: 2, temperatura: 17, enFuego: false },
        { id: 3, temperatura: 19, enFuego: false },
      ],
      ubicacion: { lat: -40.1527, lng: -71.3530 },
    },
    {
      id: 6,
      nombre: 'Celda Esquel Oeste',
      timestamp: '11:10:58',
      activa: true,
      sensores: [
        { id: 1, temperatura: 32, enFuego: false },
        { id: 2, temperatura: 35, enFuego: false },
        { id: 3, temperatura: 49, enFuego: false },
        { id: 4, temperatura: 51, enFuego: true },
      ],
      ubicacion: { lat: -42.9116, lng: -71.3206 },
    },
    {
      id: 7,
      nombre: 'Celda Lago Puelo',
      timestamp: '11:05:44',
      activa: false,
      sensores: [
        { id: 1, temperatura: 15, enFuego: false },
        { id: 2, temperatura: 16, enFuego: false },
      ],
      ubicacion: { lat: -42.0749, lng: -71.6111 },
    },
    {
      id: 8,
      nombre: 'Celda Junín de los Andes',
      timestamp: '10:58:11',
      activa: true,
      sensores: [
        { id: 1, temperatura: 27, enFuego: false },
        { id: 2, temperatura: 29, enFuego: false },
        { id: 3, temperatura: 26, enFuego: false },
        { id: 4, temperatura: 28, enFuego: false },
        { id: 5, temperatura: 30, enFuego: false },
      ],
      ubicacion: { lat: -39.9505, lng: -71.0742 },
    },
  ];
};

const generateTemperatureData = (celdas: Celda[]): TemperatureReading[] => {
  const data: TemperatureReading[] = [];
  const now = new Date();

  // Generate 1 year of data (one reading every 6 hours = ~1460 points)
  for (let i = 365 * 4; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);

    // Seasonal variation: warmer in summer months, cooler in winter
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const seasonalBase = 25 + 15 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2);

    // Daily variation
    const hourOfDay = date.getHours();
    const dailyVariation = 5 * Math.sin((hourOfDay / 24) * 2 * Math.PI - Math.PI / 2);

    const reading: TemperatureReading = { timestamp: date.toISOString() };

    celdas.forEach((celda, index) => {
      // Random noise slightly different per cell
      const noise = (Math.random() - 0.5) * 8 + (index % 5);
      const temp = seasonalBase + dailyVariation + noise;
      reading[`celda_${celda.id}`] = Math.round(Math.max(5, Math.min(65, temp)));
    });

    data.push(reading);
  }

  return data;
};

export const dataService = {
  getCeldas: async (): Promise<Celda[]> => {
    const cells = await getCellsFull();
    return cells.map(cellToCelda);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const celdas = generateMockCeldas();
    
    const celdasActivas = celdas.filter((c) => c.activa).length;
    const posiblesIncendios = celdas.filter((c) => 
      c.sensores.some((s) => s.enFuego)
    ).length;
    
    let totalSensoresAlerta = 0;
    let totalTemp = 0;
    let totalSensores = 0;
    
    celdas.forEach((celda) => {
      celda.sensores.forEach((sensor) => {
        if (sensor.temperatura > 50) totalSensoresAlerta++;
        totalTemp += sensor.temperatura;
        totalSensores++;
      });
    });
    
    return {
      celdasActivas,
      celdasTotales: celdas.length,
      posiblesIncendios,
      sensoresEnAlerta: totalSensoresAlerta,
      temperaturaPromedio: Math.round(totalTemp / totalSensores),
      umbralTemperatura: 50,
    };
  },

  getTemperatureHistory: async (celdas: Celda[], timeRange: TimeRange): Promise<TemperatureReading[]> => {
    let activeCeldas = celdas;
    if (activeCeldas.length === 0) {
      const cells = await getCellsFull();
      activeCeldas = cells.map(cellToCelda);
    }

    if (activeCeldas.length === 0) return [];

    // Build sensor → cell map for temperature-only sensors (fallback: all sensors if no type info)
    const sensorToCellId = new Map<number, number>();
    activeCeldas.forEach((celda) => {
      celda.sensores
        .filter((s) => s.tipo === 'temperatura' && s.id !== 0)
        .forEach((s) => sensorToCellId.set(s.id, celda.id));
    });

    if (sensorToCellId.size === 0) {
      activeCeldas.forEach((celda) => {
        celda.sensores
          .filter((s) => s.id !== 0)
          .forEach((s) => sensorToCellId.set(s.id, celda.id));
      });
    }

    if (sensorToCellId.size === 0) return [];

    // Build date range from local time to match server's naive datetime storage
    const pad = (n: number) => String(n).padStart(2, '0');
    const localIso = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.000Z`;

    const now = new Date();
    let minDate: Date;
    let maxDate: Date;

    switch (timeRange) {
      case 'day':
        minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        maxDate = now;
        break;
      case 'month':
        minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        maxDate = now;
        break;
      case 'year':
        minDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        maxDate = now;
        break;
    }

    const sensorPollings = await getSensorPollingsByDate({
      sensorsIds: Array.from(sensorToCellId.keys()),
      min: localIso(minDate),
      max: localIso(maxDate),
    });

    // Group into 5-minute buckets → one TemperatureReading per bucket per cell
    const readingsMap = new Map<string, TemperatureReading>();

    sensorPollings.forEach((polling) => {
      const cellId = sensorToCellId.get(polling.sensorId);
      if (cellId === undefined) return;

      const value = parseFloat(polling.pollingValue.replace(',', '.'));
      if (isNaN(value)) return;

      const date = new Date(polling.dateTime);
      date.setSeconds(0, 0);
      date.setMinutes(Math.floor(date.getMinutes() / 5) * 5);
      const key = date.toISOString();

      if (!readingsMap.has(key)) readingsMap.set(key, { timestamp: key });

      const reading = readingsMap.get(key)!;
      const prev = reading[`celda_${cellId}`] as number | undefined;
      reading[`celda_${cellId}`] = prev !== undefined ? (prev + value) / 2 : value;
    });

    return Array.from(readingsMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  },

  getConfig: async (): Promise<Config> => {
    const settings = await getAllSettings();
    const map = new Map(settings.map((s) => [s.code, s.value]));

    return {
      umbrales: {
        temperatura: Number(map.get(SETTING_CODES.TEMPERATURA_UMBRAL) ?? DEFAULT_CONFIG.umbrales.temperatura),
        intervaloMedicion: Number(map.get(SETTING_CODES.INTERVALO_MEDICION) ?? DEFAULT_CONFIG.umbrales.intervaloMedicion),
      },
      notificaciones: {
        email: map.get(SETTING_CODES.NOTIF_EMAIL) === 'true',
        emailDireccion: map.get(SETTING_CODES.NOTIF_EMAIL_DIRECCION) ?? DEFAULT_CONFIG.notificaciones.emailDireccion,
        whatsapp: map.get(SETTING_CODES.NOTIF_WHATSAPP) === 'true',
        sms: map.get(SETTING_CODES.NOTIF_SMS) === 'true',
        telefono: map.get(SETTING_CODES.NOTIF_TELEFONO) ?? DEFAULT_CONFIG.notificaciones.telefono,
      },
    };
  },

  updateConfig: async (config: Config): Promise<void> => {
    await Promise.all([
      updateSetting({ code: SETTING_CODES.TEMPERATURA_UMBRAL, summary: 'Temperatura umbral de alerta (°C)', value: String(config.umbrales.temperatura) }),
      updateSetting({ code: SETTING_CODES.INTERVALO_MEDICION, summary: 'Intervalo de medición de sensores (segundos)', value: String(config.umbrales.intervaloMedicion) }),
      updateSetting({ code: SETTING_CODES.NOTIF_EMAIL, summary: 'Notificaciones por email activadas', value: String(config.notificaciones.email) }),
      updateSetting({ code: SETTING_CODES.NOTIF_EMAIL_DIRECCION, summary: 'Dirección de email para notificaciones', value: config.notificaciones.emailDireccion }),
      updateSetting({ code: SETTING_CODES.NOTIF_WHATSAPP, summary: 'Notificaciones por WhatsApp activadas', value: String(config.notificaciones.whatsapp) }),
      updateSetting({ code: SETTING_CODES.NOTIF_SMS, summary: 'Notificaciones por SMS activadas', value: String(config.notificaciones.sms) }),
      updateSetting({ code: SETTING_CODES.NOTIF_TELEFONO, summary: 'Número de teléfono para notificaciones', value: config.notificaciones.telefono }),
    ]);
  },

  deleteCelda: async (id: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log('Celda eliminada:', id);
  },

  createCelda: async (celda: Partial<Celda>): Promise<Celda> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: Math.floor(Math.random() * 1000),
      nombre: celda.nombre || 'Nueva Celda',
      timestamp: new Date().toLocaleTimeString(),
      activa: true,
      sensores: [],
      ubicacion: celda.ubicacion || { lat: -41.1335, lng: -71.3103 },
    };
  },
};
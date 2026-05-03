import type { Celda, DashboardStats, TemperatureReading, Config } from '../types';

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

const generateTemperatureData = (): TemperatureReading[] => {
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

    // Random noise
    const noise = (Math.random() - 0.5) * 8;

    const temp = seasonalBase + dailyVariation + noise;

    data.push({
      timestamp: date.toISOString(),
      temperatura: Math.round(Math.max(5, Math.min(65, temp))),
    });
  }

  return data;
};

export const dataService = {
  getCeldas: async (): Promise<Celda[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return generateMockCeldas();
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

  getTemperatureHistory: async (): Promise<TemperatureReading[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return generateTemperatureData();
  },

  getConfig: async (): Promise<Config> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      umbrales: {
        temperatura: 50,
        intervaloMedicion: 10,
      },
      notificaciones: {
        email: true,
        emailDireccion: 'abc@mail.com',
        whatsapp: false,
        sms: false,
        telefono: '+54 9 11 1234-5678',
      },
    };
  },

  updateConfig: async (config: Config): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Config actualizada:', config);
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
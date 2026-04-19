import type { Celda, DashboardStats, TemperatureReading, Config } from '../types';

const generateMockCeldas = (): Celda[] => {
  return [
    {
      id: 1,
      nombre: 'Celda Bariloche Norte',
      timestamp: '11:29:32',
      activa: true,
      sensores: [
        { id: 1, temperatura: 20, enFuego: false },
        { id: 2, temperatura: 20, enFuego: false },
        { id: 3, temperatura: 20, enFuego: false },
        { id: 4, temperatura: 20, enFuego: false },
      ],
      ubicacion: { lat: -41.1335, lng: -71.3103 }, // Bariloche
    },
    {
      id: 2,
      nombre: 'Celda Ushuaia Centro',
      timestamp: '11:29:32',
      activa: false,
      sensores: [
        { id: 1, temperatura: 45, enFuego: false },
        { id: 2, temperatura: 52, enFuego: true },
        { id: 3, temperatura: 38, enFuego: false },
        { id: 4, temperatura: 41, enFuego: false },
      ],
      ubicacion: { lat: -54.8019, lng: -68.3029 }, // Ushuaia
    },
    {
      id: 3,
      nombre: 'Celda El Bolsón Sur',
      timestamp: '11:29:32',
      activa: false,
      sensores: [
        { id: 1, temperatura: 55, enFuego: true },
        { id: 2, temperatura: 48, enFuego: false },
        { id: 3, temperatura: 50, enFuego: false },
        { id: 4, temperatura: 46, enFuego: false },
      ],
      ubicacion: { lat: -41.9628, lng: -71.5339 }, // El Bolsón
    },
    {
      id: 4,
      nombre: 'Celda Villa La Angostura',
      timestamp: '11:29:32',
      activa: false,
      sensores: [
        { id: 1, temperatura: 60, enFuego: true },
        { id: 2, temperatura: 58, enFuego: true },
        { id: 3, temperatura: 55, enFuego: true },
        { id: 4, temperatura: 52, enFuego: true },
      ],
      ubicacion: { lat: -40.7621, lng: -71.6644 }, // Villa La Angostura
    },
  ];
};

const generateTemperatureData = (): TemperatureReading[] => {
  const data: TemperatureReading[] = [];
  const baseDate = new Date('2038-04-05');
  
  for (let i = 0; i < 50; i++) {
    const date = new Date(baseDate);
    date.setHours(date.getHours() + i * 2);
    
    const temp = 30 + Math.random() * 30;
    
    data.push({
      timestamp: date.toISOString(),
      temperatura: Math.round(temp),
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
        intervaloMedicion: 600,
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
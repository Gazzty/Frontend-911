import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { websocketService, type ConnectionStatus } from '../services/websocketService';
import type { Medicion, Celda } from '../types';

interface SensorDataContextType {
  /** Mediciones crudas del WebSocket (último batch procesado) */
  mediciones: Medicion[];
  /** Historial completo de mediciones acumuladas */
  historialMediciones: Medicion[];
  /** Celdas actualizadas con datos reales del WebSocket */
  celdas: Celda[];
  /** Estado de la conexión WebSocket */
  connectionStatus: ConnectionStatus;
  /** Última vez que se recibieron datos */
  lastUpdate: Date | null;
  /** Intervalo de medición actual en segundos */
  intervaloMedicion: number;
  /** Actualizar el intervalo de medición */
  setIntervaloMedicion: (intervalo: number) => void;
}

const SensorDataContext = createContext<SensorDataContextType | null>(null);

/**
 * Mapeo estático de sensorId a celda.
 * Mientras no haya un endpoint REST para obtener la configuración de celdas,
 * usamos estos datos mock como base y actualizamos los valores con el WebSocket.
 */
const CELDAS_BASE: Celda[] = [
  {
    id: 1,
    nombre: 'Celda Bariloche Norte',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 1, temperatura: 0, enFuego: false },
      { id: 2, temperatura: 0, enFuego: false },
      { id: 3, temperatura: 0, enFuego: false },
      { id: 4, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -41.1335, lng: -71.3103 },
  },
  {
    id: 2,
    nombre: 'Celda Ushuaia Centro',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 5, temperatura: 0, enFuego: false },
      { id: 6, temperatura: 0, enFuego: false },
      { id: 7, temperatura: 0, enFuego: false },
      { id: 8, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -54.8019, lng: -68.3029 },
  },
  {
    id: 3,
    nombre: 'Celda El Bolsón Sur',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 9, temperatura: 0, enFuego: false },
      { id: 10, temperatura: 0, enFuego: false },
      { id: 11, temperatura: 0, enFuego: false },
      { id: 12, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -41.9628, lng: -71.5339 },
  },
  {
    id: 4,
    nombre: 'Celda Villa La Angostura',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 13, temperatura: 0, enFuego: false },
      { id: 14, temperatura: 0, enFuego: false },
      { id: 15, temperatura: 0, enFuego: false },
      { id: 16, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -40.7621, lng: -71.6644 },
  },
  {
    id: 5,
    nombre: 'Celda San Martín de los Andes',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 17, temperatura: 0, enFuego: false },
      { id: 18, temperatura: 0, enFuego: false },
      { id: 19, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -40.1527, lng: -71.3530 },
  },
  {
    id: 6,
    nombre: 'Celda Esquel Oeste',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 20, temperatura: 0, enFuego: false },
      { id: 21, temperatura: 0, enFuego: false },
      { id: 22, temperatura: 0, enFuego: false },
      { id: 23, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -42.9116, lng: -71.3206 },
  },
  {
    id: 7,
    nombre: 'Celda Lago Puelo',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 24, temperatura: 0, enFuego: false },
      { id: 25, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -42.0749, lng: -71.6111 },
  },
  {
    id: 8,
    nombre: 'Celda Junín de los Andes',
    timestamp: '--:--:--',
    activa: true,
    sensores: [
      { id: 26, temperatura: 0, enFuego: false },
      { id: 27, temperatura: 0, enFuego: false },
      { id: 28, temperatura: 0, enFuego: false },
      { id: 29, temperatura: 0, enFuego: false },
      { id: 30, temperatura: 0, enFuego: false },
    ],
    ubicacion: { lat: -39.9505, lng: -71.0742 },
  },
];

const UMBRAL_TEMPERATURA = 50;
/** Intervalo por defecto en segundos (mismo que en Config mock) */
const DEFAULT_INTERVALO = 600;

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [historialMediciones, setHistorialMediciones] = useState<Medicion[]>([]);
  const [celdas, setCeldas] = useState<Celda[]>(CELDAS_BASE);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('desconectado');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [intervaloMedicion, setIntervaloMedicion] = useState(DEFAULT_INTERVALO);

  const celdasRef = useRef<Celda[]>(CELDAS_BASE);
  /** Buffer de mediciones que se acumulan hasta que el intervalo las procesa */
  const bufferRef = useRef<Medicion[]>([]);

  const actualizarCeldas = useCallback((nuevasMediciones: Medicion[]) => {
    const celdasActualizadas = celdasRef.current.map((celda) => {
      let celdaModificada = false;
      const sensoresActualizados = celda.sensores.map((sensor) => {
        // Buscar la última medición para este sensor (la más reciente del buffer)
        const medicionesDelSensor = nuevasMediciones.filter((m) => m.sensorId === sensor.id);
        const medicion = medicionesDelSensor[medicionesDelSensor.length - 1];
        if (medicion) {
          celdaModificada = true;
          const temp = parseFloat(medicion.value.trim());
          return {
            ...sensor,
            temperatura: isNaN(temp) ? sensor.temperatura : temp,
            enFuego: !isNaN(temp) && temp > UMBRAL_TEMPERATURA,
          };
        }
        return sensor;
      });

      if (celdaModificada) {
        // Actualizar timestamp de la celda con la medición más reciente
        const medicionesDelaCelda = nuevasMediciones.filter((m) =>
          celda.sensores.some((s) => s.id === m.sensorId)
        );
        const ultimaMedicion = medicionesDelaCelda[medicionesDelaCelda.length - 1];
        const fecha = ultimaMedicion ? new Date(ultimaMedicion.date) : null;
        const timestamp = fecha
          ? fecha.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          : celda.timestamp;

        return {
          ...celda,
          sensores: sensoresActualizados,
          timestamp,
          activa: true,
        };
      }

      return celda;
    });

    celdasRef.current = celdasActualizadas;
    setCeldas(celdasActualizadas);
  }, []);

  // Escuchar mensajes del WebSocket y acumularlos en el buffer
  useEffect(() => {
    websocketService.start();

    const unsubMessage = websocketService.onMessage((nuevasMediciones) => {
      bufferRef.current = [...bufferRef.current, ...nuevasMediciones];
    });

    const unsubStatus = websocketService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubMessage();
      unsubStatus();
      websocketService.stop();
    };
  }, []);

  // Procesar el buffer al ritmo del intervalo configurado
  useEffect(() => {
    const procesarBuffer = () => {
      const buffer = bufferRef.current;
      if (buffer.length === 0) return;

      // Vaciar buffer
      bufferRef.current = [];

      // Actualizar estado
      setMediciones(buffer);
      setHistorialMediciones((prev) => [...prev, ...buffer]);
      setLastUpdate(new Date());
      actualizarCeldas(buffer);
    };

    // Procesar inmediatamente si ya hay datos en el buffer
    procesarBuffer();

    const intervalMs = intervaloMedicion * 1000;
    const intervalId = setInterval(procesarBuffer, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervaloMedicion, actualizarCeldas]);

  return (
    <SensorDataContext.Provider
      value={{
        mediciones,
        historialMediciones,
        celdas,
        connectionStatus,
        lastUpdate,
        intervaloMedicion,
        setIntervaloMedicion,
      }}
    >
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorData = (): SensorDataContextType => {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData debe usarse dentro de un SensorDataProvider');
  }
  return context;
};

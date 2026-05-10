import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { websocketService, type ConnectionStatus } from '../services/websocketService';
import type { Medicion, Celda } from '../types';
import { getCellsFull, type Cell } from '../api/cellApi';

interface SensorDataContextType {
  /** Mediciones crudas del WebSocket (último batch procesado) */
  mediciones: Medicion[];
  /** Historial completo de mediciones acumuladas */
  historialMediciones: Medicion[];
  /** Celdas con datos reales del backend + actualizaciones del WebSocket */
  celdas: Celda[];
  /** Estado de la conexión WebSocket */
  connectionStatus: ConnectionStatus;
  /** Última vez que se recibieron datos */
  lastUpdate: Date | null;
  /** Intervalo de medición actual en segundos */
  intervaloMedicion: number;
  /** Actualizar el intervalo de medición */
  setIntervaloMedicion: (intervalo: number) => void;
  /** true mientras se cargan las celdas desde la API */
  cargandoCeldas: boolean;
  /** Vuelve a buscar las celdas desde la API y actualiza el estado */
  refreshCeldas: () => Promise<void>;
}

const SensorDataContext = createContext<SensorDataContextType | null>(null);

const UMBRAL_TEMPERATURA = 50;
const DEFAULT_INTERVALO = 10;

function cellToCelda(cell: Cell): Celda {
  return {
    id: cell.id,
    nombre: cell.description,
    timestamp: '--:--:--',
    activa: cell.active,
    sensores: cell.sensors
      .filter((s) => s.active)
      .map((s) => ({ id: s.id ?? 0, temperatura: 0, enFuego: false })),
    ubicacion: {
      lat: parseFloat(cell.latitude),
      lng: parseFloat(cell.longitude),
    },
  };
}

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [mediciones, setMediciones] = useState<Medicion[]>([]);
  const [historialMediciones, setHistorialMediciones] = useState<Medicion[]>([]);
  const [celdas, setCeldas] = useState<Celda[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('desconectado');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [intervaloMedicion, setIntervaloMedicion] = useState(DEFAULT_INTERVALO);
  const [cargandoCeldas, setCargandoCeldas] = useState(true);

  const celdasRef = useRef<Celda[]>([]);
  const bufferRef = useRef<Medicion[]>([]);

  // Cargar celdas desde la API REST al montar
  useEffect(() => {
    getCellsFull()
      .then((cells) => {
        const celdasDelApi = cells.map(cellToCelda);
        celdasRef.current = celdasDelApi;
        setCeldas(celdasDelApi);
      })
      .catch((err) => {
        console.error('[CellAPI] Error al cargar celdas:', err);
      })
      .finally(() => {
        setCargandoCeldas(false);
      });
  }, []);

  const refreshCeldas = useCallback(async () => {
    try {
      const cells = await getCellsFull();
      const celdasDelApi = cells.map(cellToCelda);
      celdasRef.current = celdasDelApi;
      setCeldas(celdasDelApi);
    } catch (err) {
      console.error('[CellAPI] Error al refrescar celdas:', err);
    }
  }, []);

  const actualizarCeldas = useCallback((nuevasMediciones: Medicion[]) => {
    const celdasActualizadas = celdasRef.current.map((celda) => {
      let celdaModificada = false;
      const sensoresActualizados = celda.sensores.map((sensor) => {
        const medicionesDelSensor = nuevasMediciones.filter((m) => m.sensorId === sensor.id);
        const medicion = medicionesDelSensor[medicionesDelSensor.length - 1];
        if (medicion) {
          celdaModificada = true;
          const temp = parseFloat((medicion.pollingValue ?? '').trim());
          return {
            ...sensor,
            temperatura: isNaN(temp) ? sensor.temperatura : temp,
            enFuego: !isNaN(temp) && temp > UMBRAL_TEMPERATURA,
          };
        }
        return sensor;
      });

      if (celdaModificada) {
        const medicionesDelaCelda = nuevasMediciones.filter((m) =>
          celda.sensores.some((s) => s.id === m.sensorId)
        );
        const ultimaMedicion = medicionesDelaCelda[medicionesDelaCelda.length - 1];
        const fecha = ultimaMedicion?.dateTime ? new Date(ultimaMedicion.dateTime) : null;
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

  const hasReceivedInitialDataRef = useRef(false);

  const procesarBuffer = useCallback(() => {
    const buffer = bufferRef.current;
    if (buffer.length === 0) return;

    bufferRef.current = [];

    setMediciones(buffer);
    setHistorialMediciones((prev) => [...prev, ...buffer]);
    setLastUpdate(new Date());
    actualizarCeldas(buffer);
  }, [actualizarCeldas]);

  // Escuchar mensajes del WebSocket y acumularlos en el buffer
  useEffect(() => {
    websocketService.start();

    const unsubMessage = websocketService.onMessage((nuevasMediciones) => {
      bufferRef.current = [...bufferRef.current, ...nuevasMediciones];
      
      // Si es el primer mensaje que recibimos, lo procesamos inmediatamente
      // para no tener que esperar a que pase el primer intervalo
      if (!hasReceivedInitialDataRef.current) {
        hasReceivedInitialDataRef.current = true;
        procesarBuffer();
      }
    });

    const unsubStatus = websocketService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubMessage();
      unsubStatus();
      websocketService.stop();
      hasReceivedInitialDataRef.current = false;
    };
  }, [procesarBuffer]);

  // Procesar el buffer al ritmo del intervalo configurado
  useEffect(() => {
    const intervalMs = intervaloMedicion * 1000;
    const intervalId = setInterval(procesarBuffer, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervaloMedicion, procesarBuffer]);

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
        cargandoCeldas,
        refreshCeldas,
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

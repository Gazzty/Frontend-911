import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { websocketService, type ConnectionStatus } from '../services/websocketService';
import type { Medicion, Celda } from '../types';
import { getCellsFull, type Cell } from '../api/cellApi';
import { getAllSettings } from '../api/settingsApi';
import { toaster } from '../lib/toaster';

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
  /** Umbral de temperatura para alerta (°C), leído de la configuración del backend */
  umbralTemperatura: number;
}

const SensorDataContext = createContext<SensorDataContextType | null>(null);

const DEFAULT_UMBRAL = 50;
const DEFAULT_INTERVALO = 10;

function cellToCelda(cell: Cell): Celda {
  return {
    id: cell.id,
    nombre: cell.description,
    timestamp: '--:--:--',
    activa: cell.active,
    sensores: cell.sensors
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
  const [umbralTemperatura, setUmbralTemperatura] = useState(DEFAULT_UMBRAL);

  const celdasRef = useRef<Celda[]>([]);
  const bufferRef = useRef<Medicion[]>([]);
  const umbralRef = useRef(DEFAULT_UMBRAL);
  const lastMedicionAtRef = useRef<Record<number, number>>({});

  // Cargar celdas y umbral desde la API REST al montar
  useEffect(() => {
    getAllSettings()
      .then((settings) => {
        const setting = settings.find((s) => s.code === 'TempMax');
        const value = setting ? Number(setting.value) : DEFAULT_UMBRAL;
        if (!isNaN(value) && value > 0) {
          umbralRef.current = value;
          setUmbralTemperatura(value);
        }
      })
      .catch(() => {});

    getCellsFull()
      .then((cells) => {
        const celdasDelApi = cells.map(cellToCelda);
        celdasRef.current = celdasDelApi;
        setCeldas(celdasDelApi);

        // Si ya llegaron mensajes del WebSocket mientras cargaban las celdas,
        // procesarlos ahora sin esperar el próximo tick del intervalo.
        procesarBuffer();
      })
      .catch((err) => {
        console.error('[CellAPI] Error al cargar celdas:', err);
      })
      .finally(() => {
        setCargandoCeldas(false);
      });
  // procesarBuffer es estable (useCallback con deps vacías) → no causa re-ejecuciones
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshCeldas = useCallback(async () => {
    try {
      const cells = await getCellsFull();
      const celdasDelApi = cells.map(cellToCelda);
      celdasRef.current = celdasDelApi;
      setCeldas(celdasDelApi);
      procesarBuffer();
    } catch (err) {
      console.error('[CellAPI] Error al refrescar celdas:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actualizarCeldas = useCallback((nuevasMediciones: Medicion[]) => {
    const celdasActualizadas = celdasRef.current.map((celda) => {
      let celdaModificada = false;
      const sensoresActualizados = celda.sensores.map((sensor) => {
        // Cuando el sensor tiene id=0 (no asignado por el backend), aceptamos
        // cualquier medición disponible como fallback.
        const medicionesDelSensor =
          sensor.id !== 0
            ? nuevasMediciones.filter((m) => m.sensorId === sensor.id)
            : nuevasMediciones;
        const medicion = medicionesDelSensor[medicionesDelSensor.length - 1];
        if (medicion) {
          const rawValue = (medicion.pollingValue ?? '').trim();
          if (rawValue.toLowerCase() === 'e') return sensor;
          celdaModificada = true;
          if (sensor.tipo === 'fuego') {
            return { ...sensor, enFuego: rawValue === '1' };
          }
          const temp = parseFloat(rawValue.replace(',', '.'));
          return {
            ...sensor,
            temperatura: isNaN(temp) ? sensor.temperatura : temp,
            enFuego: !isNaN(temp) && temp > umbralRef.current,
          };
        }
        return sensor;
      });

      if (celdaModificada) {
        lastMedicionAtRef.current[celda.id] = Date.now();
        const tieneIdReal = celda.sensores.some((s) => s.id !== 0);
        const medicionesDelaCelda = tieneIdReal
          ? nuevasMediciones.filter((m) => celda.sensores.some((s) => s.id === m.sensorId))
          : nuevasMediciones;
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

  const procesarBuffer = useCallback(() => {
    const buffer = bufferRef.current;
    if (buffer.length === 0) return;

    bufferRef.current = [];

    setMediciones(buffer);
    setHistorialMediciones((prev) => [...prev, ...buffer]);
    setLastUpdate(new Date());
    actualizarCeldas(buffer);
  }, [actualizarCeldas]);

  // Marcar celdas como inactivas si no reciben datos en 3 ciclos de polling
  useEffect(() => {
    const TIMEOUT_MS = intervaloMedicion * 3 * 1000;

    const interval = setInterval(() => {
      const ahora = Date.now();
      setCeldas((prev) => {
        let cambio = false;
        const actualizadas = prev.map((celda) => {
          const ultima = lastMedicionAtRef.current[celda.id];
          if (!ultima) return celda;
          const debeEstarInactiva = ahora - ultima > TIMEOUT_MS;
          if (debeEstarInactiva === celda.activa) {
            cambio = true;
            return { ...celda, activa: !debeEstarInactiva };
          }
          return celda;
        });
        if (cambio) celdasRef.current = actualizadas;
        return cambio ? actualizadas : prev;
      });
    }, intervaloMedicion * 1000);

    return () => clearInterval(interval);
  }, [intervaloMedicion]);

  // Escuchar mensajes del WebSocket y procesar inmediatamente
  useEffect(() => {
    websocketService.start();

    const unsubMessage = websocketService.onMessage((nuevasMediciones) => {
      bufferRef.current = [...bufferRef.current, ...nuevasMediciones];

      // Procesar solo si las celdas ya están cargadas.
      // Si aún no cargaron, el dato queda en el buffer y se procesa
      // cuando getCellsFull resuelve (ver el useEffect de carga).
      if (celdasRef.current.length > 0) {
        procesarBuffer();
      }
    });

    const unsubStatus = websocketService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    const unsubConnectionInfo = websocketService.onSensorConnectionInfo((info) => {
      const sensorLabel = info.sensorId != null ? `Sensor ${info.sensorId}` : 'Sensor';
      const cellLabel = info.cellDescription ? ` — ${info.cellDescription}` : '';
      if (info.isConnected) {
        toaster.create({
          title: `${sensorLabel} conectado`,
          description: `${sensorLabel}${cellLabel} se conectó correctamente.`,
          type: 'success',
          duration: 4000,
        });
      } else {
        toaster.create({
          title: `${sensorLabel} desconectado`,
          description: `${sensorLabel}${cellLabel} se desconectó o reportó una medición errónea.`,
          type: 'error',
          duration: 5000,
        });
      }
    });

    return () => {
      unsubMessage();
      unsubStatus();
      unsubConnectionInfo();
      websocketService.stop();
    };
  }, [procesarBuffer]);

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
        umbralTemperatura,
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

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Sensor, Alert, SystemConfig } from '../types/sensor';
import { mockSensors, mockAlerts, defaultConfig } from '../data/mockData';

interface SensorContextType {
  sensors: Sensor[];
  alerts: Alert[];
  config: SystemConfig;
  updateConfig: (newConfig: SystemConfig) => void;
  addSensor: (sensor: Omit<Sensor, 'id' | 'lastUpdate'>) => void;
  updateSensor: (id: string, updates: Partial<Sensor>) => void;
  deleteSensor: (id: string) => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prevSensors) =>
        prevSensors.map((sensor) => {
          const tempChange = (Math.random() - 0.5) * 5;
          const newTemp = Math.max(15, Math.min(80, sensor.temperature + tempChange));

          let status: 'active' | 'inactive' | 'alert' = 'active';
          let color = '#22c55e';

          if (newTemp >= config.temperatureThreshold) {
            status = 'alert';
            color = '#ef4444';
          } else if (newTemp >= config.temperatureThreshold * 0.7) {
            color = '#f97316';
          } else if (newTemp >= config.temperatureThreshold * 0.5) {
            color = '#eab308';
          }

          return {
            ...sensor,
            temperature: newTemp,
            status,
            color,
            lastUpdate: new Date(),
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [config.temperatureThreshold]);

  const updateConfig = (newConfig: SystemConfig) => {
    setConfig(newConfig);
  };

  const addSensor = (sensor: Omit<Sensor, 'id' | 'lastUpdate'>) => {
    const newSensor: Sensor = {
      ...sensor,
      id: `sensor-${Date.now()}`,
      lastUpdate: new Date(),
    };
    setSensors([...sensors, newSensor]);
  };

  const updateSensor = (id: string, updates: Partial<Sensor>) => {
    setSensors(
      sensors.map((sensor) =>
        sensor.id === id ? { ...sensor, ...updates, lastUpdate: new Date() } : sensor
      )
    );
  };

  const deleteSensor = (id: string) => {
    setSensors(sensors.filter((sensor) => sensor.id !== id));
  };

  return (
    <SensorContext.Provider
      value={{
        sensors,
        alerts,
        config,
        updateConfig,
        addSensor,
        updateSensor,
        deleteSensor,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensors() {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
}

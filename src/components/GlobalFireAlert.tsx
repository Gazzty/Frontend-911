import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import FireAlert from './dashboard/FireAlert';
import { useSensorData } from '../context/SensorDataContext';

const RUTAS_EXCLUIDAS = ['/login', '/register'];

const GlobalFireAlert = () => {
  const { celdas } = useSensorData();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const prevCountRef = useRef(0);

  const celdasEnFuego = useMemo(
    () => celdas.filter((c) => c.sensores.some((s) => s.enFuego)),
    [celdas]
  );

  useEffect(() => {
    if (celdasEnFuego.length > prevCountRef.current) {
      setDismissed(false);
    }
    prevCountRef.current = celdasEnFuego.length;
  }, [celdasEnFuego.length]);

  if (RUTAS_EXCLUIDAS.includes(location.pathname)) return null;

  return (
    <FireAlert
      celdasEnFuego={dismissed ? [] : celdasEnFuego}
      onDismiss={() => setDismissed(true)}
    />
  );
};

export default GlobalFireAlert;

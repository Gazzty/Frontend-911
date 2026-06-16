import { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import FireAlert from './dashboard/FireAlert';
import { useSensorData } from '../context/SensorDataContext';

const RUTAS_EXCLUIDAS = ['/login', '/register'];

const GlobalFireAlert = () => {
  const { celdas, umbralTemperatura } = useSensorData();
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const prevFireCountRef = useRef(0);
  const prevWarnCountRef = useRef(0);

  const celdasEnFuego = useMemo(
    () => celdas.filter((c) => c.sensores.some((s) => s.enFuego)),
    [celdas]
  );

  const celdasEnAlertaTemp = useMemo(
    () => celdas.filter(
      (c) =>
        !c.sensores.some((s) => s.enFuego) &&
        c.sensores.some((s) => s.tipo === 'temperatura' && s.temperatura > umbralTemperatura)
    ),
    [celdas, umbralTemperatura]
  );

  useEffect(() => {
    if (celdasEnFuego.length > prevFireCountRef.current || celdasEnAlertaTemp.length > prevWarnCountRef.current) {
      setDismissed(false);
    }
    prevFireCountRef.current = celdasEnFuego.length;
    prevWarnCountRef.current = celdasEnAlertaTemp.length;
  }, [celdasEnFuego.length, celdasEnAlertaTemp.length]);

  if (RUTAS_EXCLUIDAS.includes(location.pathname)) return null;

  const alertType = celdasEnFuego.length > 0 ? 'fire' : 'warning';
  const celdasAlerta = celdasEnFuego.length > 0 ? celdasEnFuego : celdasEnAlertaTemp;

  return (
    <FireAlert
      celdasEnFuego={dismissed ? [] : celdasAlerta}
      alertType={alertType}
      onDismiss={() => setDismissed(true)}
    />
  );
};

export default GlobalFireAlert;

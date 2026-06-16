import { Box, VStack, Text, Grid, GridItem, Button, Flex, IconButton, HStack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaFire, FaTimes } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import StatCard from '../components/dashboard/StatCard';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import CeldasList from '../components/dashboard/CeldasList';
import AlertasRecientes from '../components/dashboard/AlertasRecientes';
import FireAlert from '../components/dashboard/FireAlert';
import { dataService } from '../services/dataService';
import { useSensorData } from '../context/SensorDataContext';
import { websocketService } from '../services/websocketService';
import type { DashboardStats, TemperatureReading, TimeRange } from '../types';

const MotionBox = motion.create(Box);

const toaster = createToaster({ placement: 'top', duration: 3000 });

const CONNECTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  conectado: { label: 'Conectado', color: '#51CF66' },
  conectando: { label: 'Conectando...', color: '#FFD43B' },
  desconectado: { label: 'Desconectado', color: '#868E96' },
  error: { label: 'Error de conexión', color: '#FF6B6B' },
};

const DashboardPage = () => {
  const { celdas, connectionStatus, lastUpdate: wsLastUpdate, umbralTemperatura } = useSensorData();
  const [temperatureData, setTemperatureData] = useState<TemperatureReading[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [fireAlertDismissed, setFireAlertDismissed] = useState(false);
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);
  const prevFireCountRef = useRef(0);

  const celdasEnFuego = useMemo(
    () => celdas.filter((c) => c.sensores.some((s) => s.enFuego)),
    [celdas]
  );

  const stats = useMemo<DashboardStats>(() => {
    const celdasActivas = celdas.filter((c) => c.activa).length;
    const posiblesIncendios = celdas.filter((c) => c.sensores.some((s) => s.enFuego)).length;
    let totalSensoresAlerta = 0;
    let totalTemp = 0;
    let totalSensores = 0;
    celdas.forEach((celda) => {
      celda.sensores.forEach((sensor) => {
        if (sensor.tipo !== 'temperatura') return;
        if (sensor.temperatura > umbralTemperatura) totalSensoresAlerta++;
        totalTemp += sensor.temperatura;
        totalSensores++;
      });
    });
    return {
      celdasActivas,
      celdasTotales: celdas.length,
      posiblesIncendios,
      sensoresEnAlerta: totalSensoresAlerta,
      temperaturaPromedio: totalSensores > 0 ? Math.round(totalTemp / totalSensores) : 0,
      umbralTemperatura,
    };
  }, [celdas, umbralTemperatura]);

  useEffect(() => {
    if (wsLastUpdate) {
      setLastUpdate(wsLastUpdate);
      setAlertDismissed(false);
    }
  }, [wsLastUpdate]);

  useEffect(() => {
    const currentCount = stats.posiblesIncendios;
    const prevCount = prevFireCountRef.current;
    prevFireCountRef.current = currentCount;

    if (currentCount <= prevCount) return;

    setFireAlertDismissed(false);
    // Delay so the backend has time to finish writing the event log entry
    // before we fetch it (the DB write happens after the WS broadcast).
    const timer = setTimeout(() => setAlertRefreshKey((k) => k + 1), 1000);
    return () => clearTimeout(timer);
  }, [stats.posiblesIncendios]);

  // WarningFired covers temperature-threshold alerts (type 4) on every polling
  // cycle, including cases where posiblesIncendios doesn't change.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const unsub = websocketService.onWarningFired(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setAlertRefreshKey((k) => k + 1), 1000);
    });
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    loadData(timeRange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const loadData = async (range: TimeRange) => {
    if (temperatureData.length === 0) setIsLoading(true);
    else setIsRefreshing(true);
    setHasError(false);
    try {
      const activeCeldas = celdas.length > 0 ? celdas : await dataService.getCeldas();
      const tempData = await dataService.getTemperatureHistory(activeCeldas, range);
      if (!Array.isArray(tempData)) throw new Error('Datos inválidos');
      setTemperatureData(tempData);
      setLastUpdate(new Date());
      setHasError(false);
    } catch (error) {
      setHasError(true);
      toaster.create({
        title: 'Error al cargar datos',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los datos',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const activeCeldas = celdas.length > 0 ? celdas : await dataService.getCeldas();
      const tempData = await dataService.getTemperatureHistory(activeCeldas, timeRange);
      setTemperatureData(tempData);
      setLastUpdate(new Date());
      setAlertDismissed(false);
      toaster.create({ title: 'Actualizado', description: 'Datos actualizados correctamente', type: 'success', duration: 2000 });
    } catch {
      toaster.create({ title: 'Error', description: 'No se pudieron actualizar los datos', type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const diff = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return 'Hace menos de 1 minuto';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    return lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && temperatureData.length === 0) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 6, lg: 8 }}>
          <VStack gap={6}>
            <Box bg="white" p={8} borderRadius="lg" boxShadow="sm" w="full" textAlign="center">
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                display="inline-block"
              >
                <FaSync size={32} color="#FF4500" />
              </MotionBox>
              <Text mt={4} fontSize="lg" fontWeight="600">Cargando datos del sistema...</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>Obteniendo información en tiempo real</Text>
            </Box>
          </VStack>
        </Box>
      </>
    );
  }

  if (hasError && temperatureData.length === 0) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 6, lg: 8 }}>
          <Box bg="red.50" p={8} borderRadius="lg" borderWidth="1px" borderColor="red.200" textAlign="center">
            <Text fontSize="lg" fontWeight="600" color="red.700" mb={2}>Error al cargar el Dashboard</Text>
            <Text fontSize="sm" color="red.600" mb={4}>No se pudieron obtener los datos del sistema</Text>
            <Button bg="red.500" color="white" onClick={loadData} _hover={{ bg: 'red.600' }}>Reintentar</Button>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <FireAlert
        celdasEnFuego={fireAlertDismissed ? [] : (celdasEnFuego.length > 0 ? celdasEnFuego : [{ id: 'test-1', nombre: 'Bariloche', activa: true, sensores: [] }, { id: 'test-2', nombre: 'San Martín de los Andes', activa: true, sensores: [] }])}
        onDismiss={() => setFireAlertDismissed(true)}
      />
      <Navbar />
      <Box maxW="1300px" mx="auto" px={{ base: 4, md: 8, lg: 12 }} py={{ base: 4, md: 6, lg: 8 }}>
        <VStack gap={{ base: 4, md: 6 }} align="stretch">

          {/* Header */}
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 3, sm: 0 }}
          >
            <Box>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="700" mb={1}>
                Dashboard
              </Text>
              <Text fontSize="sm" color="gray.500">
                Monitoreo en tiempo real del sistema de detección de incendios
              </Text>
              <HStack gap={2} mt={1} flexWrap="wrap">
                {lastUpdate && (
                  <Text fontSize="xs" color="gray.400">
                    Última actualización: {formatLastUpdate()}
                  </Text>
                )}
                <HStack gap={1}>
                  <Box
                    w={2} h={2} borderRadius="full"
                    bg={CONNECTION_STATUS_LABELS[connectionStatus]?.color || '#868E96'}
                  />
                  <Text fontSize="xs" color="gray.400">
                    {CONNECTION_STATUS_LABELS[connectionStatus]?.label || 'Desconocido'}
                  </Text>
                </HStack>
              </HStack>
            </Box>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshData}
              loading={isRefreshing}
              disabled={isRefreshing}
              flexShrink={0}
            >
              <FaSync />
              <Text ml={2}>Actualizar</Text>
            </Button>
          </Flex>

          {/* Fire alert banner */}
          {stats.posiblesIncendios > 0 && !alertDismissed && (
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                bg="red.50"
                borderWidth="2px"
                borderColor="red.500"
                borderRadius="lg"
                p={{ base: 3, md: 4 }}
                position="relative"
              >
                <Flex align="center" gap={3}>
                  <Box
                    bg="red.500"
                    borderRadius="full"
                    p={2}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <FaFire color="white" size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="md" fontWeight="700" color="red.700">
                      ¡Alerta de Incendio!
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Se detectaron {stats.posiblesIncendios} posible
                      {stats.posiblesIncendios > 1 ? 's' : ''} incendio
                      {stats.posiblesIncendios > 1 ? 's' : ''}. Revisar celdas inmediatamente.
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Cerrar alerta"
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => setAlertDismissed(true)}
                    flexShrink={0}
                  >
                    <FaTimes />
                  </IconButton>
                </Flex>
              </Box>
            </MotionBox>
          )}

          {/* Stat cards: 2 cols on mobile, 4 on desktop */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={{ base: 3, md: 4 }}>
            <GridItem>
              <StatCard title="Celdas Activas" value={stats.celdasActivas} subtitle={`de ${stats.celdasTotales} totales`} delay={0} />
            </GridItem>
            <GridItem>
              <StatCard title="Posibles incendios" value={stats.posiblesIncendios} subtitle="Requiere atención" delay={0.1} />
            </GridItem>
            <GridItem>
              <StatCard title="Sensores en Alerta" value={stats.sensoresEnAlerta} subtitle="Por encima del umbral" delay={0.2} />
            </GridItem>
            <GridItem>
              <StatCard title="Temp. Promedio" value={`${stats.temperaturaPromedio}°C`} subtitle={`Umbral ${stats.umbralTemperatura}°C`} delay={0.3} />
            </GridItem>
          </Grid>

          {/* Chart + cell list: stacked on mobile, side by side on desktop */}
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={{ base: 4, md: 6 }}
            alignItems="stretch"
          >
            <GridItem>
              <TemperatureChart
                data={temperatureData}
                celdas={celdas}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                isLoading={isRefreshing}
              />
            </GridItem>
            <GridItem minH={0}>
              {celdas.length > 0 ? (
                <CeldasList celdas={celdas} />
              ) : (
                <Box
                  bg="white" p={6} borderRadius="lg" boxShadow="sm"
                  borderWidth="1px" borderColor="gray.200" textAlign="center"
                >
                  <Text color="gray.500">No hay celdas configuradas</Text>
                </Box>
              )}
            </GridItem>
          </Grid>

          <AlertasRecientes refreshKey={alertRefreshKey} />
        </VStack>
      </Box>
    </>
  );
};

export default DashboardPage;

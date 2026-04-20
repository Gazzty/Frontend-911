import { Box, VStack, Text, Grid, GridItem, Button, Flex, IconButton } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaFire, FaTimes } from 'react-icons/fa';
import Navbar from '../components/layout/Navbar';
import StatCard from '../components/dashboard/StatCard';
import TemperatureChart from '../components/dashboard/TemperatureChart';
import CeldasList from '../components/dashboard/CeldasList';

import AlertasRecientes from '../components/dashboard/AlertasRecientes';
import { dataService } from '../services/dataService';
import type { DashboardStats, TemperatureReading, Celda } from '../types';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [temperatureData, setTemperatureData] = useState<TemperatureReading[]>([]);
  const [celdas, setCeldas] = useState<Celda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const [statsData, tempData, celdasData] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getTemperatureHistory(),
        dataService.getCeldas(),
      ]);

      if (!statsData || typeof statsData.celdasActivas !== 'number') {
        throw new Error('Datos de estadísticas inválidos');
      }

      if (!Array.isArray(tempData) || tempData.length === 0) {
        throw new Error('Datos de temperatura inválidos');
      }

      if (!Array.isArray(celdasData)) {
        throw new Error('Datos de celdas inválidos');
      }

      setStats(statsData);
      setTemperatureData(tempData);
      setCeldas(celdasData);
      setLastUpdate(new Date());
      setHasError(false);
      setAlertDismissed(false);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setHasError(true);

      toaster.create({
        title: 'Error al cargar datos',
        description: error instanceof Error ? error.message : 'No se pudieron cargar los datos del dashboard',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);

    try {
      const [statsData, tempData, celdasData] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getTemperatureHistory(),
        dataService.getCeldas(),
      ]);

      setStats(statsData);
      setTemperatureData(tempData);
      setCeldas(celdasData);
      setLastUpdate(new Date());
      setAlertDismissed(false);

      toaster.create({
        title: 'Actualizado',
        description: 'Datos actualizados correctamente',
        type: 'success',
        duration: 2000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron actualizar los datos',
        type: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (diff < 60) return 'Hace menos de 1 minuto';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`;
    return lastUpdate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading && !stats) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={12} py={8}>
          <VStack gap={6}>
            <Box
              bg="white"
              p={8}
              borderRadius="lg"
              boxShadow="sm"
              w="full"
              textAlign="center"
            >
              <MotionBox
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                display="inline-block"
              >
                <FaSync size={32} color="#FF4500" />
              </MotionBox>
              <Text mt={4} fontSize="lg" fontWeight="600">
                Cargando datos del sistema...
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Obteniendo información en tiempo real
              </Text>
            </Box>
          </VStack>
        </Box>
      </>
    );
  }

  if (hasError && !stats) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={12} py={8}>
          <Box
            bg="red.50"
            p={8}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="red.200"
            textAlign="center"
          >
            <Text fontSize="lg" fontWeight="600" color="red.700" mb={2}>
              Error al cargar el Dashboard
            </Text>
            <Text fontSize="sm" color="red.600" mb={4}>
              No se pudieron obtener los datos del sistema
            </Text>
            <Button
              bg="red.500"
              color="white"
              onClick={loadData}
              _hover={{ bg: 'red.600' }}
            >
              Reintentar
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Box maxW="1300px" mx="auto" px={12} py={8}>
        <VStack gap={6} align="stretch">
          <Box>
            <Flex justify="space-between" align="start">
              <Box>
                <Text fontSize="2xl" fontWeight="700" mb={1}>
                  Dashboard
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Monitoreo en tiempo real del sistema de detección de incendios
                </Text>
                {lastUpdate && (
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    Última actualización: {formatLastUpdate()}
                  </Text>
                )}
              </Box>
              <Button
                size="sm"
                variant="ghost"
                onClick={refreshData}
                loading={isRefreshing}
                disabled={isRefreshing}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  transition="transform 0.3s ease"
                  _groupHover={{ transform: 'rotate(180deg)' }}
                >
                  <FaSync />
                </Box>
                <Text ml={2}>Actualizar</Text>
              </Button>
            </Flex>
          </Box>

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
                p={4}
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
                  >
                    <FaFire color="white" size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="md" fontWeight="700" color="red.700">
                      ¡Alerta de Incendio!
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Se detectaron {stats.posiblesIncendios} posible{stats.posiblesIncendios > 1 ? 's' : ''} incendio{stats.posiblesIncendios > 1 ? 's' : ''}. Revisar celdas inmediatamente.
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Cerrar alerta"
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => setAlertDismissed(true)}
                  >
                    <FaTimes />
                  </IconButton>
                </Flex>
              </Box>
            </MotionBox>
          )}

          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <GridItem>
              <StatCard
                title="Celdas Activas"
                value={stats.celdasActivas}
                subtitle={`de ${stats.celdasTotales} totales`}
                delay={0}
              />
            </GridItem>
            <GridItem>
              <StatCard
                title="Posibles incendios"
                value={stats.posiblesIncendios}
                subtitle="Requiere atención"
                delay={0.1}
              />
            </GridItem>
            <GridItem>
              <StatCard
                title="Sensores en Alerta"
                value={stats.sensoresEnAlerta}
                subtitle="Por encima del umbral"
                delay={0.2}
              />
            </GridItem>
            <GridItem>
              <StatCard
                title="Temp. Promedio"
                value={`${stats.temperaturaPromedio}°C`}
                subtitle={`Umbral ${stats.umbralTemperatura}°C`}
                delay={0.3}
              />
            </GridItem>
          </Grid>

          <VStack gap={6} align="stretch">
            <Grid templateColumns="repeat(2, 1fr)" gap={6} alignItems="stretch">
              <GridItem h="100%">
                {temperatureData.length > 0 ? (
                  <TemperatureChart data={temperatureData} />
                ) : (
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                    textAlign="center"
                  >
                    <Text color="gray.500">No hay datos de temperatura disponibles</Text>
                  </Box>
                )}
              </GridItem>
              <GridItem minH={0} h="100%">
                {celdas.length > 0 ? (
                  <CeldasList celdas={celdas} />
                ) : (
                  <Box
                    bg="white"
                    p={6}
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                    textAlign="center"
                    h="100%"
                  >
                    <Text color="gray.500">No hay celdas configuradas</Text>
                  </Box>
                )}
              </GridItem>
            </Grid>

            <AlertasRecientes celdas={celdas} />
          </VStack>
        </VStack>
      </Box>
    </>
  );
};

export default DashboardPage;
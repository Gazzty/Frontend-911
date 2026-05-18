import { Box, VStack, Text, Stack } from '@chakra-ui/react';
import { toaster } from '../lib/toaster';
import { FaThermometerHalf, FaBell, FaDatabase } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import UmbralesConfig from '../components/config/UmbralesConfig';
import NotificacionesConfig from '../components/config/NotificacionesConfig';
import CeldasConfig from '../components/config/CeldasConfig';
import ConfigTabButton from '../components/config/ConfigTabButton';
import { dataService } from '../services/dataService';
import { useSensorData } from '../context/SensorDataContext';
import { createCell, deleteCell, updateCell } from '../api/cellApi';
import type { CreateCellDto, UpdateCellDto } from '../api/cellApi';
import { getSensorById, getSensors, updateSensor } from '../api/sensorApi';
import type { Sensor as ApiSensor } from '../api/sensorApi';
import type { Config } from '../types';

const ConfiguracionPage = () => {
  const { intervaloMedicion, setIntervaloMedicion, celdas, refreshCeldas } = useSensorData();

  const [sensoresDisponibles, setSensoresDisponibles] = useState<ApiSensor[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadData();
    getSensors().then(setSensoresDisponibles).catch(() => {});
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const configData = await dataService.getConfig();
      configData.umbrales.intervaloMedicion = intervaloMedicion;
      setConfig(configData);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUmbrales = async (temperatura: number, intervalo: number) => {
    if (!config) return;

    const newConfig = {
      ...config,
      umbrales: {
        temperatura,
        intervaloMedicion: intervalo,
      },
    };

    try {
      await dataService.updateConfig(newConfig);
      setConfig(newConfig);
      // Actualizar el intervalo en el context compartido
      setIntervaloMedicion(intervalo);
      
      toaster.create({
        title: 'Guardado',
        description: 'Configuración de umbrales actualizada',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        type: 'error',
      });
    }
  };

  const handleSaveNotificaciones = async (notifConfig: {
    email: boolean;
    emailDireccion: string;
    whatsapp: boolean;
    sms: boolean;
    telefono: string;
  }) => {
    if (!config) return;

    const newConfig = {
      ...config,
      notificaciones: notifConfig,
    };

    try {
      await dataService.updateConfig(newConfig);
      setConfig(newConfig);
      
      toaster.create({
        title: 'Guardado',
        description: 'Configuración de notificaciones actualizada',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        type: 'error',
      });
    }
  };

  const handleDeleteCelda = async (id: number): Promise<void> => {
    try {
      await deleteCell(id);
      await refreshCeldas();
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No se pudo eliminar la celda',
        type: 'error',
      });
      throw new Error('delete_failed');
    }
  };

  const handleBulkDeleteCeldas = async (ids: number[]): Promise<void> => {
    try {
      for (const id of ids) {
        await deleteCell(id);
      }
      await refreshCeldas();
    } catch {
      await refreshCeldas().catch(() => {});
      toaster.create({
        title: 'Error',
        description: 'No se pudieron eliminar todas las celdas',
        type: 'error',
      });
      throw new Error('bulk_delete_failed');
    }
  };

  const handleUpdateCelda = async (data: UpdateCellDto): Promise<void> => {
    try {
      await updateCell(data);
      await refreshCeldas();
      getSensors().then(setSensoresDisponibles).catch(() => {});
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No se pudo actualizar la celda',
        type: 'error',
      });
      throw new Error('update_failed');
    }
  };

  const handleCreateCelda = async (data: CreateCellDto & { sensors?: Array<{ sensorDbId: number }> }) => {
    let cellId: number | null = null;
    try {
      const { sensors, ...cellData } = data;
      const { id } = await createCell(cellData);
      cellId = id;

      // Assign existing sensors (from /Sensor/Get-all) to the new cell by updating their cellId.
      if (sensors && sensors.length > 0) {
        for (const { sensorDbId } of sensors) {
          const existingSensor = await getSensorById(sensorDbId);
          await updateSensor({ ...existingSensor, cellId, active: true });
        }
      }

      await refreshCeldas();
      // Refresh sensor list so newly assigned sensors no longer appear as available
      getSensors().then(setSensoresDisponibles).catch(() => {});
    } catch (error) {
      if (cellId !== null) {
        await refreshCeldas().catch(() => {});
      }
      toaster.create({
        title: 'Error',
        description: 'No se pudo asignar el sensor a la celda',
        type: 'error',
      });
      throw error;
    }
  };

  if (isLoading || !config) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={12} py={8}>
          <Text>Cargando...</Text>
        </Box>
      </>
    );
  }

  const tabs = [
    { icon: FaThermometerHalf, label: 'Umbrales' },
    { icon: FaBell, label: 'Notificaciones' },
    { icon: FaDatabase, label: 'Sistema' },
  ];

  return (
    <>
      <Navbar />
      <Box maxW="1300px" mx="auto" px={12} py={8}>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="700" mb={1}>
              Configuraciones
            </Text>
            <Text fontSize="sm" color="gray.500">
              Gestiona las configuraciones del sistema y sensores
            </Text>
          </Box>

          <Box>
            <Stack
              direction="row"
              bg="white"
              p={2}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              w="fit-content"
              gap={0}
            >
              {tabs.map((tab, index) => (
                <ConfigTabButton
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  isActive={activeTab === index}
                  onClick={() => setActiveTab(index)}
                />
              ))}
            </Stack>

            <Box mt={6}>
              {activeTab === 0 && (
                <UmbralesConfig
                  temperatura={config.umbrales.temperatura}
                  intervaloMedicion={config.umbrales.intervaloMedicion}
                  onSave={handleSaveUmbrales}
                />
              )}
              {activeTab === 1 && (
                <NotificacionesConfig
                  email={config.notificaciones.email}
                  emailDireccion={config.notificaciones.emailDireccion}
                  whatsapp={config.notificaciones.whatsapp}
                  sms={config.notificaciones.sms}
                  telefono={config.notificaciones.telefono}
                  onSave={handleSaveNotificaciones}
                />
              )}
              {activeTab === 2 && (
                <CeldasConfig
                  celdas={celdas}
                  sensoresDisponibles={sensoresDisponibles}
                  onDelete={handleDeleteCelda}
                  onBulkDelete={handleBulkDeleteCeldas}
                  onCreate={handleCreateCelda}
                  onUpdate={handleUpdateCelda}
                />
              )}
            </Box>
          </Box>
        </VStack>
      </Box>
    </>
  );
};

export default ConfiguracionPage;
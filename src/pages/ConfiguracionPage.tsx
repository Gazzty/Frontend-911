import { Box, VStack, Text, Stack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { FaThermometerHalf, FaBell, FaDatabase } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import UmbralesConfig from '../components/config/UmbralesConfig';
import NotificacionesConfig from '../components/config/NotificacionesConfig';
import CeldasConfig from '../components/config/CeldasConfig';
import ConfigTabButton from '../components/config/ConfigTabButton';
import { dataService } from '../services/dataService';
import type { Config, Celda } from '../types';

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const ConfiguracionPage = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [celdas, setCeldas] = useState<Celda[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configData, celdasData] = await Promise.all([
        dataService.getConfig(),
        dataService.getCeldas(),
      ]);

      setConfig(configData);
      setCeldas(celdasData);
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

  const handleDeleteCelda = async (id: number) => {
    try {
      await dataService.deleteCelda(id);
      setCeldas(celdas.filter((c) => c.id !== id));
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo eliminar la celda',
        type: 'error',
      });
    }
  };

  const handleCreateCelda = async (nombre: string) => {
    try {
      const newCelda = await dataService.createCelda({ nombre });
      setCeldas([...celdas, newCelda]);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo crear la celda',
        type: 'error',
      });
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
                  onDelete={handleDeleteCelda}
                  onCreate={handleCreateCelda}
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
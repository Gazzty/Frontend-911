import { Box, VStack, Text, Grid, GridItem, HStack } from '@chakra-ui/react'
import { useRef } from 'react'
import Navbar from '../components/layout/Navbar'
import MapView from '../components/map/MapView'
import type { MapViewRef } from '../components/map/MapView'
import CeldasSidebar from '../components/map/CeldasSidebar'
import { useSensorData } from '../context/SensorDataContext'

const CONNECTION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  conectado: { label: 'Conectado', color: '#51CF66' },
  conectando: { label: 'Conectando...', color: '#FFD43B' },
  desconectado: { label: 'Desconectado', color: '#868E96' },
  error: { label: 'Error de conexión', color: '#FF6B6B' },
}

const MapaPage = () => {
  const { celdas, connectionStatus } = useSensorData()
  const mapRef = useRef<MapViewRef>(null)

  return (
    <>
      <Navbar />
      <Box maxW="1300px" mx="auto" px={12} py={8}>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="700" mb={1}>
              Mapa de Sensores
            </Text>
            <HStack gap={2}>
              <Text fontSize="sm" color="gray.500">
                Visualización geográfica de todos los sensores activos
              </Text>
              <HStack gap={1}>
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={CONNECTION_STATUS_LABELS[connectionStatus]?.color || '#868E96'}
                />
                <Text fontSize="xs" color="gray.400">
                  {CONNECTION_STATUS_LABELS[connectionStatus]?.label || 'Desconocido'}
                </Text>
              </HStack>
            </HStack>
          </Box>

          <Grid templateColumns="2fr 1fr" gap={6}>
            <GridItem>
              <MapView ref={mapRef} celdas={celdas} />
            </GridItem>
            <GridItem>
              <CeldasSidebar
                celdas={celdas}
                onCeldaClick={(celda) => mapRef.current?.focusOnCelda(celda)}
              />
            </GridItem>
          </Grid>
        </VStack>
      </Box>
    </>
  )
}

export default MapaPage
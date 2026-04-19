import { Box, VStack, Text, Grid, GridItem } from '@chakra-ui/react'
import { createToaster } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import Navbar from '../components/layout/Navbar'
import MapView from '../components/map/MapView'
import type { MapViewRef } from '../components/map/MapView'
import CeldasSidebar from '../components/map/CeldasSidebar'
import { dataService } from '../services/dataService'
import type { Celda } from '../types'

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
})

const MapaPage = () => {
  const [celdas, setCeldas] = useState<Celda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const mapRef = useRef<MapViewRef>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const celdasData = await dataService.getCeldas()
      setCeldas(celdasData)
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Box maxW="1300px" mx="auto" px={12} py={8}>
          <Text>Cargando...</Text>
        </Box>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Box maxW="1300px" mx="auto" px={12} py={8}>
        <VStack gap={6} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="700" mb={1}>
              Mapa de Sensores
            </Text>
            <Text fontSize="sm" color="gray.500">
              Visualización geográfica de todos los sensores activos
            </Text>
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
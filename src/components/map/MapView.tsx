import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useImperativeHandle, forwardRef, useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Celda } from '../../types'

const MotionBox = motion.create(Box)

interface MapViewProps {
  celdas: Celda[]
}

export interface MapViewRef {
  focusOnCelda: (celda: Celda) => void
}

const crearIconoCelda = (hasAlert: boolean) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: ${hasAlert ? '#FF4500' : '#51CF66'};
        border: 3px solid white;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.15);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })

const MapView = forwardRef<MapViewRef, MapViewProps>(({ celdas }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<number, L.Marker>>({})
  const ringsRef = useRef<Record<number, L.CircleMarker>>({})

  useImperativeHandle(ref, () => ({
    focusOnCelda: (celda: Celda) => {
      const map = mapInstanceRef.current
      if (!map) return

      map.setView([celda.ubicacion.lat, celda.ubicacion.lng], 12, {
        animate: true,
      })

      const marker = markersRef.current[celda.id]
      if (marker) {
        marker.openPopup()
      }
    },
  }))

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Calculate center from celdas
    let center: [number, number] = [-41.1335, -71.3103]
    if (celdas.length > 0) {
      const latAvg = celdas.reduce((acc, c) => acc + c.ubicacion.lat, 0) / celdas.length
      const lngAvg = celdas.reduce((acc, c) => acc + c.ubicacion.lng, 0) / celdas.length
      center = [latAvg, lngAvg]
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, 6)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Cleanup
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when celdas change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove old markers and rings
    Object.values(markersRef.current).forEach((m) => m.remove())
    Object.values(ringsRef.current).forEach((r) => r.remove())
    markersRef.current = {}
    ringsRef.current = {}

    // Add new markers
    celdas.forEach((celda) => {
      const hasAlert = celda.sensores.some((s) => s.enFuego)
      const tempSensor = celda.sensores.find((s) => s.tipo === 'temperatura')

      const marker = L.marker([celda.ubicacion.lat, celda.ubicacion.lng], {
        icon: crearIconoCelda(hasAlert),
      }).addTo(map)

      const popupContent = `
        <div style="min-width: 220px; font-family: Inter, sans-serif;">
          <h3 style="margin: 0 0 12px 0; font-weight: 600; font-size: 16px; color: #000;">
            ${celda.nombre}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${tempSensor ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: #6B6B6B;">Temperatura:</span>
              <span style="font-weight: 600;">${tempSensor.temperatura}°C</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: #6B6B6B;">Estado Red:</span>
              <span style="font-weight: 600; color: ${celda.activa ? '#51CF66' : '#6B6B6B'};">
                ${celda.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            ${
              hasAlert
                ? `<div style="margin-top: 8px; padding: 8px; background: #FEE; border-radius: 6px; border-left: 3px solid #FF4500;">
                    <div style="font-weight: 600; color: #C53030; font-size: 14px;">⚠️ ALERTA</div>
                    <div style="font-size: 13px; color: #E53E3E; margin-top: 4px;">
                      Alerta de incendio detectada
                    </div>
                  </div>`
                : `<div style="margin-top: 8px; padding: 8px; background: #F0FFF4; border-radius: 6px; border-left: 3px solid #51CF66;">
                    <div style="font-weight: 600; color: #22543D; font-size: 14px;">✓ NORMAL</div>
                    <div style="font-size: 13px; color: #38A169; margin-top: 4px;">
                      Operando normalmente
                    </div>
                  </div>`
            }
            <div style="margin-top: 8px; font-size: 12px; color: #A0AEC0;">
              Última actualización: ${celda.timestamp}
            </div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)

      // Status ring
      const ring = L.circleMarker([celda.ubicacion.lat, celda.ubicacion.lng], {
        radius: 22,
        color: hasAlert ? '#FF4500' : '#51CF66',
        fillColor: hasAlert ? '#FF4500' : '#51CF66',
        fillOpacity: 0.15,
      }).addTo(map)
      ringsRef.current[celda.id] = ring

      markersRef.current[celda.id] = marker
    })
  }, [celdas])

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Box
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        h={{ base: '320px', md: '450px', lg: '600px' }}
      >
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      </Box>
    </MotionBox>
  )
})

MapView.displayName = 'MapView'

export default MapView
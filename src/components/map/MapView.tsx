import { Box, HStack, Text, VStack } from '@chakra-ui/react'
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

const crearIconoCelda = (hasAlert: boolean, isActive: boolean) => {
  if (hasAlert) {
    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
          <div style="
            position:absolute;top:50%;left:50%;
            width:44px;height:44px;border-radius:50%;
            background:rgba(255,69,0,0.35);
            animation:mapPulse 1.4s ease-out infinite;
          "></div>
          <div style="
            position:relative;z-index:1;
            width:30px;height:30px;border-radius:50%;
            background:linear-gradient(135deg,#FF6B35,#CC2200);
            border:2.5px solid white;
            box-shadow:0 3px 12px rgba(255,69,0,0.55);
            display:flex;align-items:center;justify-content:center;
            font-size:14px;line-height:1;
          ">🔥</div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    })
  }

  const bg = isActive
    ? 'linear-gradient(135deg,#69DB7C,#2F9E44)'
    : 'linear-gradient(135deg,#CED4DA,#868E96)'
  const shadow = isActive
    ? '0 3px 10px rgba(47,158,68,0.4)'
    : '0 2px 6px rgba(0,0,0,0.15)'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:26px;height:26px;border-radius:50%;
        background:${bg};
        border:2.5px solid white;
        box-shadow:${shadow};
      "></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

const MapView = forwardRef<MapViewRef, MapViewProps>(({ celdas }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<number, L.Marker>>({})
  const ringsRef = useRef<Record<number, L.CircleMarker>>({})

  useEffect(() => {
    const styleId = 'map-pulse-keyframes'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        @keyframes mapPulse {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    focusOnCelda: (celda: Celda) => {
      const map = mapInstanceRef.current
      if (!map) return
      map.setView([celda.ubicacion.lat, celda.ubicacion.lng], 12, { animate: true })
      markersRef.current[celda.id]?.openPopup()
    },
  }))

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    let center: [number, number] = [-41.1335, -71.3103]
    if (celdas.length > 0) {
      const latAvg = celdas.reduce((acc, c) => acc + c.ubicacion.lat, 0) / celdas.length
      const lngAvg = celdas.reduce((acc, c) => acc + c.ubicacion.lng, 0) / celdas.length
      center = [latAvg, lngAvg]
    }

    const map = L.map(mapContainerRef.current).setView(center, 6)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(markersRef.current).forEach((m) => m.remove())
    Object.values(ringsRef.current).forEach((r) => r.remove())
    markersRef.current = {}
    ringsRef.current = {}

    celdas.forEach((celda) => {
      const hasAlert = celda.sensores.some((s) => s.enFuego)
      const tempSensor = celda.sensores.find((s) => s.tipo === 'temperatura')

      const marker = L.marker([celda.ubicacion.lat, celda.ubicacion.lng], {
        icon: crearIconoCelda(hasAlert, celda.activa),
      }).addTo(map)

      const estadoColor = hasAlert ? '#C53030' : celda.activa ? '#22543D' : '#4A5568'
      const estadoBg = hasAlert ? '#FFF5F5' : celda.activa ? '#F0FFF4' : '#F7FAFC'
      const estadoBorder = hasAlert ? '#FC8181' : celda.activa ? '#9AE6B4' : '#CBD5E0'
      const estadoTexto = hasAlert ? '⚠️ ALERTA DE INCENDIO' : celda.activa ? '✓ OPERANDO NORMAL' : '— INACTIVA'

      const popupContent = `
        <div style="min-width:220px;font-family:Inter,system-ui,sans-serif;padding:4px 0;">
          <div style="font-size:15px;font-weight:700;color:#1A202C;margin-bottom:10px;">${celda.nombre}</div>
          ${tempSensor ? `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:13px;color:#718096;">Temperatura</span>
              <span style="font-size:14px;font-weight:700;color:#2D3748;">${tempSensor.temperatura}°C</span>
            </div>` : ''}
          <div style="margin-top:8px;padding:8px 10px;background:${estadoBg};border-radius:8px;border:1px solid ${estadoBorder};">
            <div style="font-size:12px;font-weight:700;color:${estadoColor};">${estadoTexto}</div>
          </div>
          <div style="margin-top:8px;font-size:11px;color:#A0AEC0;">Últ. actualización: ${celda.timestamp}</div>
        </div>
      `

      marker.bindPopup(popupContent, { maxWidth: 260 })

      if (hasAlert) {
        const ring = L.circleMarker([celda.ubicacion.lat, celda.ubicacion.lng], {
          radius: 26,
          color: '#FF4500',
          fillColor: '#FF4500',
          fillOpacity: 0.08,
          weight: 1.5,
        }).addTo(map)
        ringsRef.current[celda.id] = ring
      }

      markersRef.current[celda.id] = marker
    })
  }, [celdas])

  const leyendaItems = [
    { color: '#FF4500', label: 'Alerta de incendio' },
    { color: '#51CF66', label: 'Celda activa' },
    { color: '#A0AEC0', label: 'Celda inactiva' },
  ]

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Box
        position="relative"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0 4px 24px rgba(0,0,0,0.08)"
        borderWidth="1px"
        borderColor="gray.200"
        h={{ base: '320px', md: '450px', lg: '600px' }}
      >
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

        {/* Leyenda */}
        <Box
          position="absolute"
          bottom="24px"
          right="8px"
          zIndex={1000}
          bg="white"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="0 4px 20px rgba(0,0,0,0.12)"
          borderWidth="1px"
          borderColor="gray.100"
          pointerEvents="none"
          minW="170px"
        >
          <Box px={3} py={2} bg="gray.50" borderBottomWidth="1px" borderColor="gray.100">
            <Text fontSize="10px" fontWeight="700" color="gray.400" letterSpacing="wider" textTransform="uppercase">
              Leyenda
            </Text>
          </Box>
          <VStack align="start" gap={2} p={3}>
            {leyendaItems.map(({ color, label }) => (
              <HStack gap={2} key={label}>
                <Box
                  w="10px" h="10px" borderRadius="full"
                  bg={color}
                  boxShadow={`0 0 0 2px ${color}33`}
                  flexShrink={0}
                />
                <Text fontSize="12px" color="gray.600" fontWeight="500">{label}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Box>
    </MotionBox>
  )
})

MapView.displayName = 'MapView'

export default MapView

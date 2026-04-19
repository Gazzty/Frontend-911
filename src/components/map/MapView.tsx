import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useImperativeHandle, forwardRef, useMemo, useState, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { Celda } from '../../types'

const MotionBox = motion.create(Box)

interface MapViewProps {
  celdas: Celda[]
}

export interface MapViewRef {
  focusOnCelda: (celda: Celda) => void
}

interface FocusControllerProps {
  celdaObjetivo: Celda | null
}

interface MarkerOpenerProps {
  celdaObjetivo: Celda | null
  markerRefs: React.MutableRefObject<Record<number, L.Marker | null>>
}

const FocusController = ({ celdaObjetivo }: FocusControllerProps) => {
  const map = useMap()

  useEffect(() => {
    if (!celdaObjetivo) return

    map.setView(
      [celdaObjetivo.ubicacion.lat, celdaObjetivo.ubicacion.lng],
      12,
      { animate: true }
    )
  }, [celdaObjetivo, map])

  return null
}

const MarkerOpener = ({ celdaObjetivo, markerRefs }: MarkerOpenerProps) => {
  useEffect(() => {
    if (!celdaObjetivo) return

    const marker = markerRefs.current[celdaObjetivo.id]
    if (marker) {
      marker.openPopup()
    }
  }, [celdaObjetivo, markerRefs])

  return null
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
  const [celdaObjetivo, setCeldaObjetivo] = useState<Celda | null>(null)
  const markerRefs = useRef<Record<number, L.Marker | null>>({})

  useImperativeHandle(ref, () => ({
    focusOnCelda: (celda: Celda) => {
      setCeldaObjetivo(celda)
    },
  }))

  const centroInicial = useMemo<[number, number]>(() => {
    if (celdas.length === 0) return [-41.1335, -71.3103]

    const latPromedio =
      celdas.reduce((acc, celda) => acc + celda.ubicacion.lat, 0) / celdas.length
    const lngPromedio =
      celdas.reduce((acc, celda) => acc + celda.ubicacion.lng, 0) / celdas.length

    return [latPromedio, lngPromedio]
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
        h="600px"
      >
        <MapContainer
          center={centroInicial}
          zoom={6}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FocusController celdaObjetivo={celdaObjetivo} />
          <MarkerOpener celdaObjetivo={celdaObjetivo} markerRefs={markerRefs} />

          {celdas.map((celda) => {
            const hasAlert = celda.sensores.some((s) => s.enFuego)
            const alertCount = celda.sensores.filter((s) => s.enFuego).length
            const avgTemp = Math.round(
              celda.sensores.reduce((acc, s) => acc + s.temperatura, 0) /
                celda.sensores.length
            )

            return (
              <Marker
                key={celda.id}
                position={[celda.ubicacion.lat, celda.ubicacion.lng]}
                icon={crearIconoCelda(hasAlert)}
                ref={(markerInstance) => {
                  markerRefs.current[celda.id] = markerInstance
                }}
              >
                <Popup>
                  <div style={{ minWidth: '220px', fontFamily: 'Inter, sans-serif' }}>
                    <h3
                      style={{
                        margin: '0 0 12px 0',
                        fontWeight: 600,
                        fontSize: '16px',
                        color: '#000',
                      }}
                    >
                      {celda.nombre}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ color: '#6B6B6B' }}>Sensores:</span>
                        <span style={{ fontWeight: 600 }}>{celda.sensores.length}</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ color: '#6B6B6B' }}>Temperatura promedio:</span>
                        <span style={{ fontWeight: 600 }}>{avgTemp}°C</span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ color: '#6B6B6B' }}>Estado:</span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: celda.activa ? '#51CF66' : '#6B6B6B',
                          }}
                        >
                          {celda.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>

                      {hasAlert ? (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#FEE',
                            borderRadius: '6px',
                            borderLeft: '3px solid #FF4500',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#C53030',
                              fontSize: '14px',
                            }}
                          >
                            ⚠️ Alerta de incendio
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#E53E3E',
                              marginTop: '4px',
                            }}
                          >
                            {alertCount} sensor{alertCount > 1 ? 'es' : ''} detectó temperatura crítica
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: '#F0FFF4',
                            borderRadius: '6px',
                            borderLeft: '3px solid #51CF66',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#22543D',
                              fontSize: '14px',
                            }}
                          >
                            ✓ Sin alertas
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#38A169',
                              marginTop: '4px',
                            }}
                          >
                            Todos los sensores operando normalmente
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#A0AEC0',
                        }}
                      >
                        Última actualización: {celda.timestamp}
                      </div>
                    </div>
                  </div>
                </Popup>

                {hasAlert && (
                  <CircleMarker
                    center={[celda.ubicacion.lat, celda.ubicacion.lng]}
                    radius={22}
                    pathOptions={{
                      color: '#FF4500',
                      fillColor: '#FF4500',
                      fillOpacity: 0.15,
                    }}
                  />
                )}
              </Marker>
            )
          })}
        </MapContainer>
      </Box>
    </MotionBox>
  )
})

MapView.displayName = 'MapView'

export default MapView
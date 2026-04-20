import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useSensors } from '../context/SensorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Thermometer, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function MapView() {
  const { sensors } = useSensors();
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  const center = { lat: -41.1335, lng: -71.3103 };

  const selectedSensorData = sensors.find((s) => s.id === selectedSensor);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Mapa de Sensores</h1>
        <p className="text-gray-600 mt-1">Visualización geográfica de todos los sensores activos</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={center}
                    defaultZoom={10}
                    mapId="fire-detection-map"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                  >
                    {sensors.map((sensor) => (
                      <AdvancedMarker
                        key={sensor.id}
                        position={sensor.location}
                        onClick={() => setSelectedSensor(sensor.id)}
                      >
                        <div
                          className="relative cursor-pointer transform transition-transform hover:scale-110"
                          style={{
                            width: '32px',
                            height: '32px',
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-75"
                            style={{
                              backgroundColor: sensor.color,
                            }}
                          />
                          <div
                            className="relative w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                            style={{
                              backgroundColor: sensor.color,
                            }}
                          >
                            <Thermometer className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </AdvancedMarker>
                    ))}

                    {selectedSensor && selectedSensorData && (
                      <InfoWindow
                        position={selectedSensorData.location}
                        onCloseClick={() => setSelectedSensor(null)}
                      >
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-semibold mb-2">{selectedSensorData.name}</h3>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Temperatura:</span>{' '}
                              {Math.round(selectedSensorData.temperature)}°C
                            </p>
                            <p>
                              <span className="font-medium">Estado:</span>{' '}
                              <Badge
                                variant={selectedSensorData.status === 'alert' ? 'destructive' : 'default'}
                                className="ml-1"
                              >
                                {selectedSensorData.status === 'alert' ? 'ALERTA' : 'Normal'}
                              </Badge>
                            </p>
                            <p className="text-xs text-gray-500">
                              Actualizado: {format(selectedSensorData.lastUpdate, 'HH:mm:ss')}
                            </p>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leyenda</CardTitle>
              <CardDescription>Significado de los colores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">Normal (temperatura baja)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                <span className="text-sm">Moderada (50-70% del umbral)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span className="text-sm">Elevada (70-100% del umbral)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">Crítica (por encima del umbral)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Sensores</CardTitle>
              <CardDescription>Haz clic para ver en el mapa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sensors.map((sensor) => (
                <button
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSensor === sensor.id ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sensor.color }} />
                    <div className="flex-1">
                      <p className="text-sm">{sensor.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{Math.round(sensor.temperature)}°C</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

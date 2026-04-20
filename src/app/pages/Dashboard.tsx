import { useSensors } from '../context/SensorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, AlertTriangle, Activity, Flame } from 'lucide-react';
import { generateMockReadings } from '../data/mockData';
import { format } from 'date-fns';

export default function Dashboard() {
  const { sensors, alerts, config } = useSensors();

  const activeSensors = sensors.filter((s) => s.status !== 'inactive').length;
  const alertSensors = sensors.filter((s) => s.status === 'alert').length;
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;

  // Preparar datos para el gráfico
  const chartData = generateMockReadings('sensor-1', 7)
    .filter((_, i) => i % 12 === 0)
    .map((reading) => ({
      time: format(reading.timestamp, 'dd/MM HH:mm'),
      temperatura: Math.round(reading.temperature),
    }));

  const avgTemp =
    sensors.length > 0
      ? Math.round(sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitoreo en tiempo real del sistema de detección de incendios</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sensores Activos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeSensors}</div>
            <p className="text-xs text-muted-foreground">de {sensors.length} totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{activeAlerts}</div>
            <p className="text-xs text-muted-foreground">requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Sensores en Alerta</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{alertSensors}</div>
            <p className="text-xs text-muted-foreground">por encima del umbral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Temp. Promedio</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{avgTemp}°C</div>
            <p className="text-xs text-muted-foreground">umbral: {config.temperatureThreshold}°C</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mediciones de Temperatura</CardTitle>
            <CardDescription>Últimos 7 días de lecturas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Temperatura (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Sensores</CardTitle>
            <CardDescription>Lecturas actuales en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sensor.color }}
                    />
                    <div>
                      <p className="text-sm">{sensor.name}</p>
                      <p className="text-xs text-gray-500">{format(sensor.lastUpdate, 'HH:mm:ss')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{Math.round(sensor.temperature)}°C</p>
                    <Badge variant={sensor.status === 'alert' ? 'destructive' : 'default'} className="text-xs">
                      {sensor.status === 'alert' ? 'ALERTA' : 'Normal'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas Recientes</CardTitle>
          <CardDescription>Eventos disparados y notificaciones enviadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay alertas registradas</p>
          ) : (
            alerts.map((alert) => (
              <Alert key={alert.id} variant={alert.status === 'active' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.sensorName}</span>
                  <Badge variant={alert.type === 'temperature' ? 'destructive' : 'default'}>
                    {alert.type === 'temperature' ? 'Temperatura' : 'Predictivo'}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  <p>{alert.message}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    {format(alert.timestamp, "dd/MM/yyyy 'a las' HH:mm")}
                  </p>
                </AlertDescription>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

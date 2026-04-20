import { useState } from 'react';
import { useSensors } from '../context/SensorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Bell, Thermometer, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

export default function Settings() {
  const { config, updateConfig, sensors, addSensor } = useSensors();
  const [localConfig, setLocalConfig] = useState(config);

  const [newSensor, setNewSensor] = useState({
    name: '',
    lat: '',
    lng: '',
    temperature: '20',
  });

  const handleSaveConfig = () => {
    updateConfig(localConfig);
    toast.success('Configuración guardada correctamente');
  };

  const handleAddSensor = () => {
    if (!newSensor.name || !newSensor.lat || !newSensor.lng) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    addSensor({
      name: newSensor.name,
      location: {
        lat: parseFloat(newSensor.lat),
        lng: parseFloat(newSensor.lng),
      },
      temperature: parseFloat(newSensor.temperature),
      status: 'active',
      color: '#22c55e',
    });

    setNewSensor({ name: '', lat: '', lng: '', temperature: '20' });
    toast.success('Sensor agregado correctamente');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Configuraciones</h1>
        <p className="text-gray-600 mt-1">Gestiona las configuraciones del sistema y sensores</p>
      </div>

      <Tabs defaultValue="threshold" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threshold">
            <Thermometer className="h-4 w-4 mr-2" />
            Umbrales
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="sensors">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Sensores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threshold" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Umbrales</CardTitle>
              <CardDescription>Define los valores críticos para disparar alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Umbral de Temperatura (°C)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={localConfig.temperatureThreshold}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      temperatureThreshold: parseFloat(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Las alertas se dispararán cuando la temperatura supere este valor
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo de Medición (segundos)</Label>
                <Input
                  id="interval"
                  type="number"
                  value={localConfig.measurementInterval}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      measurementInterval: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-gray-500">
                  Frecuencia con la que los sensores toman mediciones
                </p>
              </div>

              <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Elige cómo recibir alertas del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                  <p className="text-sm text-gray-500">Recibir alertas por correo electrónico</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={localConfig.notifications.email}
                  onCheckedChange={(checked) =>
                    setLocalConfig({
                      ...localConfig,
                      notifications: { ...localConfig.notifications, email: checked },
                    })
                  }
                />
              </div>

              {localConfig.notifications.email && (
                <div className="space-y-2">
                  <Label htmlFor="email-address">Dirección de Email</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={localConfig.notifications.emailAddress}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        notifications: {
                          ...localConfig.notifications,
                          emailAddress: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsapp-notifications">Notificaciones por WhatsApp</Label>
                  <p className="text-sm text-gray-500">Recibir alertas por WhatsApp</p>
                </div>
                <Switch
                  id="whatsapp-notifications"
                  checked={localConfig.notifications.whatsapp}
                  onCheckedChange={(checked) =>
                    setLocalConfig({
                      ...localConfig,
                      notifications: { ...localConfig.notifications, whatsapp: checked },
                    })
                  }
                />
              </div>

              {localConfig.notifications.whatsapp && (
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number">Número de WhatsApp</Label>
                  <Input
                    id="whatsapp-number"
                    type="tel"
                    value={localConfig.notifications.whatsappNumber}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        notifications: {
                          ...localConfig.notifications,
                          whatsappNumber: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                  <p className="text-sm text-gray-500">Recibir alertas por mensaje de texto</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={localConfig.notifications.sms}
                  onCheckedChange={(checked) =>
                    setLocalConfig({
                      ...localConfig,
                      notifications: { ...localConfig.notifications, sms: checked },
                    })
                  }
                />
              </div>

              {localConfig.notifications.sms && (
                <div className="space-y-2">
                  <Label htmlFor="sms-number">Número de Teléfono</Label>
                  <Input
                    id="sms-number"
                    type="tel"
                    value={localConfig.notifications.smsNumber}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        notifications: {
                          ...localConfig.notifications,
                          smsNumber: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              )}

              <Button onClick={handleSaveConfig}>Guardar Cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Sensores</CardTitle>
                <CardDescription>Agregar o configurar sensores activos</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Sensor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nuevo Sensor</DialogTitle>
                    <DialogDescription>
                      Configura un nuevo sensor de temperatura para el sistema
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sensor-name">Nombre del Sensor</Label>
                      <Input
                        id="sensor-name"
                        value={newSensor.name}
                        onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                        placeholder="Ej: Sensor Bariloche Sur"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sensor-lat">Latitud</Label>
                        <Input
                          id="sensor-lat"
                          type="number"
                          step="0.0001"
                          value={newSensor.lat}
                          onChange={(e) => setNewSensor({ ...newSensor, lat: e.target.value })}
                          placeholder="-41.1335"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sensor-lng">Longitud</Label>
                        <Input
                          id="sensor-lng"
                          type="number"
                          step="0.0001"
                          value={newSensor.lng}
                          onChange={(e) => setNewSensor({ ...newSensor, lng: e.target.value })}
                          placeholder="-71.3103"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sensor-temp">Temperatura Inicial (°C)</Label>
                      <Input
                        id="sensor-temp"
                        type="number"
                        value={newSensor.temperature}
                        onChange={(e) => setNewSensor({ ...newSensor, temperature: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddSensor} className="w-full">
                      Agregar Sensor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sensors.map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sensor.color }} />
                      <div>
                        <p className="text-sm">{sensor.name}</p>
                        <p className="text-xs text-gray-500">
                          {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{Math.round(sensor.temperature)}°C</p>
                      <p className="text-xs text-gray-500">{sensor.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

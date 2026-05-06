import { Box, Text, VStack, HStack, Button, IconButton, Input, Stack, Flex } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { FaTimes, FaPlus, FaExclamationTriangle, FaMicrochip } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Celda } from '../../types';
import type { CreateCellDto } from '../../api/cellApi';

const MotionBox = motion.create(Box);

const toaster = createToaster({ placement: 'top', duration: 3000 });

interface FormSensor {
  sensorHardwareRouteId: number;
  pollingTimeInterval: number;
}

interface CeldasConfigProps {
  celdas: Celda[];
  onDelete: (id: number) => void;
  onCreate: (data: CreateCellDto) => Promise<void>;
  sensoresDisponibles: number[];
}

const CeldasConfig = ({ celdas, onDelete, onCreate, sensoresDisponibles }: CeldasConfigProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCelda, setSelectedCelda] = useState<Celda | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formSensores, setFormSensores] = useState<FormSensor[]>([]);
  const [sensorIdSelect, setSensorIdSelect] = useState('1');
  const [pollingInput, setPollingInput] = useState('10');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setDescription('');
    setLatitude('');
    setLongitude('');
    setFormSensores([]);
    setSensorIdSelect('1');
    setPollingInput('10');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) newErrors.description = 'El nombre es requerido';
    else if (description.trim().length < 3) newErrors.description = 'Mínimo 3 caracteres';
    else if (description.trim().length > 50) newErrors.description = 'Máximo 50 caracteres';

    const lat = parseFloat(latitude);
    if (!latitude) newErrors.latitude = 'La latitud es requerida';
    else if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = 'Debe ser entre -90 y 90';

    const lng = parseFloat(longitude);
    if (!longitude) newErrors.longitude = 'La longitud es requerida';
    else if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = 'Debe ser entre -180 y 180';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const availableSensorIds = sensoresDisponibles.filter(
    (id) => !formSensores.some((s) => s.sensorHardwareRouteId === id),
  );

  const addSensor = () => {
    const id = parseInt(sensorIdSelect);
    if (formSensores.some((s) => s.sensorHardwareRouteId === id)) return;
    const interval = Math.max(1, parseInt(pollingInput) || 10);
    const updated = [...formSensores, { sensorHardwareRouteId: id, pollingTimeInterval: interval }];
    setFormSensores(updated);
    const remaining = sensoresDisponibles.filter(
      (n) => !updated.some((s) => s.sensorHardwareRouteId === n),
    );
    if (remaining.length > 0) setSensorIdSelect(String(remaining[0]));
  };

  const removeSensor = (id: number) => {
    setFormSensores(formSensores.filter((s) => s.sensorHardwareRouteId !== id));
    if (availableSensorIds.length === 0) setSensorIdSelect(String(id));
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsCreating(true);
    try {
      const data: CreateCellDto = {
        description: description.trim(),
        latitude,
        longitude,
        active: true,
        sensors: formSensores.map((s) => ({
          active: true,
          sensorHardwareRouteId: s.sensorHardwareRouteId,
          type: { id: 1, description: 'Temperatura' },
          pollingTimeInterval: s.pollingTimeInterval,
        })),
      };
      await onCreate(data);
      resetForm();
      setIsCreateModalOpen(false);
      toaster.create({
        title: 'Celda creada',
        description: `"${data.description}" se creó exitosamente`,
        type: 'success',
      });
    } catch {
      // el error ya lo maneja el padre
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDeleteModal = (celda: Celda) => {
    setSelectedCelda(celda);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCelda) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedCelda.id);
      setIsDeleteModalOpen(false);
      setSelectedCelda(null);
      toaster.create({
        title: 'Celda eliminada',
        description: `${selectedCelda.nombre} fue eliminada correctamente`,
        type: 'info',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    bg: 'gray.100',
    borderWidth: hasError ? '2px' : '0',
    borderColor: hasError ? 'red.500' : 'transparent',
    _hover: { bg: 'gray.200' },
    _focus: { bg: 'white', borderWidth: '2px', borderColor: hasError ? 'red.500' : 'brand.orange' },
  });

  return (
    <>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="gray.200">
          <HStack justify="space-between" mb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="600">Gestión de Celdas</Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {celdas.length} celda{celdas.length !== 1 ? 's' : ''} configurada{celdas.length !== 1 ? 's' : ''}
              </Text>
            </Box>
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm" bg="brand.black" color="white"
                onClick={handleOpenCreateModal} _hover={{ bg: 'gray.700' }}
              >
                <FaPlus />
                <Text ml={2}>Nueva Celda</Text>
              </Button>
            </MotionBox>
          </HStack>

          <VStack gap={2} align="stretch">
            {celdas.length === 0 ? (
              <Box bg="gray.50" p={8} borderRadius="md" textAlign="center">
                <Text color="gray.500" fontSize="sm">
                  No hay celdas configuradas. Crea una nueva celda para comenzar.
                </Text>
              </Box>
            ) : (
              celdas.map((celda, index) => (
                <MotionBox
                  key={celda.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <HStack
                    bg="gray.100" p={3} borderRadius="md" justify="space-between"
                    _hover={{ bg: 'gray.200' }} transition="all 0.3s ease"
                  >
                    <VStack align="start" gap={0}>
                      <Text fontWeight="600" fontSize="sm">{celda.nombre}</Text>
                      <HStack gap={3}>
                        <Text fontSize="xs" color="gray.500">{celda.sensores.length} sensores</Text>
                        <Text fontSize="xs" color="gray.400">•</Text>
                        <Text fontSize="xs" color="gray.500">
                          {celda.ubicacion.lat.toFixed(4)}, {celda.ubicacion.lng.toFixed(4)}
                        </Text>
                      </HStack>
                    </VStack>
                    <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        aria-label="Eliminar celda" size="sm"
                        colorPalette="red" variant="ghost"
                        onClick={() => handleOpenDeleteModal(celda)}
                      >
                        <FaTimes />
                      </IconButton>
                    </MotionBox>
                  </HStack>
                </MotionBox>
              ))
            )}
          </VStack>
        </Box>
      </MotionBox>

      {/* Modal Crear Celda */}
      {isCreateModalOpen && (
        <Box
          position="fixed" top={0} left={0} right={0} bottom={0}
          bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
          zIndex={1000}
          onClick={() => !isCreating && setIsCreateModalOpen(false)}
        >
          <MotionBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              bg="white" p={6} borderRadius="lg" boxShadow="xl"
              w="520px" maxH="90vh" overflowY="auto"
            >
              <Text fontSize="lg" fontWeight="600" mb={5}>Crear Nueva Celda</Text>

              <VStack gap={4} align="stretch">
                {/* Nombre */}
                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="600">Nombre</Text>
                  <Input
                    placeholder="Ej: Celda Bariloche Norte"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={validate}
                    {...inputStyle(!!errors.description)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                  {errors.description && (
                    <Text fontSize="xs" color="red.500">{errors.description}</Text>
                  )}
                </Stack>

                {/* Coordenadas */}
                <HStack gap={3} align="start">
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" fontWeight="600">Latitud</Text>
                    <Input
                      placeholder="-41.1335"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      onBlur={validate}
                      {...inputStyle(!!errors.latitude)}
                    />
                    {errors.latitude && (
                      <Text fontSize="xs" color="red.500">{errors.latitude}</Text>
                    )}
                  </Stack>
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" fontWeight="600">Longitud</Text>
                    <Input
                      placeholder="-71.3103"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      onBlur={validate}
                      {...inputStyle(!!errors.longitude)}
                    />
                    {errors.longitude && (
                      <Text fontSize="xs" color="red.500">{errors.longitude}</Text>
                    )}
                  </Stack>
                </HStack>

                {/* Sensores */}
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="600">Sensores</Text>
                  <HStack gap={2}>
                    <Box flex={1}>
                      <select
                        value={sensorIdSelect}
                        onChange={(e) => setSensorIdSelect(e.target.value)}
                        disabled={availableSensorIds.length === 0}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#EDF2F7',
                          fontSize: '14px',
                          cursor: availableSensorIds.length === 0 ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          color: '#1A202C',
                        }}
                      >
                        {availableSensorIds.map((id) => (
                          <option key={id} value={id}>
                            Sensor {id}
                          </option>
                        ))}
                        {availableSensorIds.length === 0 && (
                          <option>Sin sensores disponibles</option>
                        )}
                      </select>
                    </Box>
                    <Box w="110px">
                      <Input
                        type="number"
                        placeholder="Intervalo"
                        value={pollingInput}
                        onChange={(e) => setPollingInput(e.target.value)}
                        min={1}
                        bg="gray.100"
                        borderWidth="0"
                        _hover={{ bg: 'gray.200' }}
                        _focus={{ bg: 'white', borderWidth: '2px', borderColor: 'brand.orange' }}
                        size="sm"
                      />
                      <Text fontSize="xs" color="gray.400" textAlign="center" mt={0.5}>seg.</Text>
                    </Box>
                    <Button
                      size="sm" bg="brand.black" color="white"
                      onClick={addSensor}
                      disabled={availableSensorIds.length === 0 || isCreating}
                      _hover={{ bg: 'gray.700' }}
                    >
                      <FaPlus />
                    </Button>
                  </HStack>

                  {formSensores.length > 0 && (
                    <VStack gap={1} align="stretch">
                      {formSensores.map((s) => (
                        <HStack
                          key={s.sensorHardwareRouteId}
                          bg="gray.100" px={3} py={1.5} borderRadius="md"
                          justify="space-between"
                        >
                          <HStack gap={2}>
                            <FaMicrochip size={12} color="#718096" />
                            <Text fontSize="sm">Sensor {s.sensorHardwareRouteId}</Text>
                          </HStack>
                          <HStack gap={3}>
                            <Text fontSize="xs" color="gray.500">{s.pollingTimeInterval}s</Text>
                            <IconButton
                              aria-label="Quitar sensor" size="xs"
                              variant="ghost" colorPalette="red"
                              onClick={() => removeSensor(s.sensorHardwareRouteId)}
                            >
                              <FaTimes size={10} />
                            </IconButton>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  )}

                  {formSensores.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      {sensoresDisponibles.length === 0
                        ? 'Sin sensores detectados vía WebSocket todavía.'
                        : 'Sin sensores asignados. Podés crear la celda sin sensores y agregarlos después.'}
                    </Text>
                  )}
                </Stack>
              </VStack>

              <HStack gap={3} mt={6}>
                <Button
                  variant="ghost" flex={1}
                  onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full" bg="brand.black" color="white"
                    onClick={handleCreate} loading={isCreating} disabled={isCreating}
                    _hover={{ bg: 'gray.700' }}
                  >
                    Crear
                  </Button>
                </MotionBox>
              </HStack>
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* Modal Confirmar Eliminación */}
      {isDeleteModalOpen && selectedCelda && (
        <Box
          position="fixed" top={0} left={0} right={0} bottom={0}
          bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
          zIndex={1000}
          onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
        >
          <MotionBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box bg="white" p={6} borderRadius="lg" boxShadow="xl" maxW="md" w="400px">
              <Flex align="center" gap={3} mb={4}>
                <Box
                  bg="red.100" borderRadius="full" p={2}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <FaExclamationTriangle color="#E53E3E" size={20} />
                </Box>
                <Text fontSize="lg" fontWeight="600">Confirmar Eliminación</Text>
              </Flex>

              <Text fontSize="sm" color="gray.600" mb={4}>
                ¿Estás seguro que deseas eliminar la celda{' '}
                <Text as="span" fontWeight="600">{selectedCelda.nombre}</Text>?{' '}
                Esta acción no se puede deshacer.
              </Text>

              <Box bg="gray.50" p={3} borderRadius="md" mb={4}>
                <Text fontSize="xs" color="gray.500" mb={1}>Información de la celda:</Text>
                <Text fontSize="xs" color="gray.700">• Sensores: {selectedCelda.sensores.length}</Text>
                <Text fontSize="xs" color="gray.700">
                  • Estado: {selectedCelda.activa ? 'Activa' : 'Inactiva'}
                </Text>
              </Box>

              <HStack gap={3}>
                <Button
                  variant="ghost" flex={1}
                  onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full" bg="red.500" color="white"
                    onClick={handleDelete} loading={isDeleting} disabled={isDeleting}
                    _hover={{ bg: 'red.600' }}
                  >
                    Eliminar
                  </Button>
                </MotionBox>
              </HStack>
            </Box>
          </MotionBox>
        </Box>
      )}
    </>
  );
};

export default CeldasConfig;

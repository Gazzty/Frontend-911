import { Box, Text, VStack, HStack, Button, IconButton, Input, Stack, Flex } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { FaTimes, FaPlus, FaExclamationTriangle, FaMicrochip, FaEdit, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Celda } from '../../types';
import type { CreateCellDto, UpdateCellDto } from '../../api/cellApi';
import type { Sensor as ApiSensor } from '../../api/sensorApi';

type CreateCellWithSensorsDto = CreateCellDto & {
  sensors?: Array<{ sensorDbId: number }>;
};

const MotionBox = motion.create(Box);

const toaster = createToaster({ placement: 'top', duration: 3000 });

interface FormSensor {
  sensorId: number;
}

interface CeldasConfigProps {
  celdas: Celda[];
  sensoresDisponibles: ApiSensor[];
  onDelete: (id: number) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
  onCreate: (data: CreateCellWithSensorsDto) => Promise<void>;
  onUpdate: (data: UpdateCellDto) => Promise<void>;
}

const CeldasConfig = ({ celdas, sensoresDisponibles, onDelete, onBulkDelete, onCreate, onUpdate }: CeldasConfigProps) => {
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modal visibility
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Targets
  const [selectedCelda, setSelectedCelda] = useState<Celda | null>(null);
  const [editingCelda, setEditingCelda] = useState<Celda | null>(null);

  // Loading
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Create form
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formSensores, setFormSensores] = useState<FormSensor[]>([]);
  const [sensorIdSelect, setSensorIdSelect] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Edit form
  const [editDescription, setEditDescription] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editFormSensors, setEditFormSensors] = useState<ApiSensor[]>([]);
  const [editSensorSelect, setEditSensorSelect] = useState('');

  // Checkbox helpers
  const allSelected = celdas.length > 0 && selectedIds.size === celdas.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(celdas.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Sensors available to add in the create form (unassigned + not already in form)
  const availableSensors = sensoresDisponibles.filter(
    (s) => s.cellId == null && !formSensores.some((fs) => fs.sensorId === s.id),
  );

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

  const validateEdit = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!editDescription.trim()) newErrors.description = 'El nombre es requerido';
    else if (editDescription.trim().length < 3) newErrors.description = 'Mínimo 3 caracteres';
    else if (editDescription.trim().length > 50) newErrors.description = 'Máximo 50 caracteres';
    const lat = parseFloat(editLatitude);
    if (!editLatitude) newErrors.latitude = 'La latitud es requerida';
    else if (isNaN(lat) || lat < -90 || lat > 90) newErrors.latitude = 'Debe ser entre -90 y 90';
    const lng = parseFloat(editLongitude);
    if (!editLongitude) newErrors.longitude = 'La longitud es requerida';
    else if (isNaN(lng) || lng < -180 || lng > 180) newErrors.longitude = 'Debe ser entre -180 y 180';
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setDescription('');
    setLatitude('');
    setLongitude('');
    setFormSensores([]);
    const first = sensoresDisponibles.find((s) => s.cellId == null);
    setSensorIdSelect(first != null ? String(first.id) : '');
    setErrors({});
  };

  const addSensor = () => {
    const id = parseInt(sensorIdSelect);
    if (isNaN(id) || formSensores.some((s) => s.sensorId === id)) return;
    const updated = [...formSensores, { sensorId: id }];
    setFormSensores(updated);
    const next = sensoresDisponibles.find((s) => s.cellId == null && !updated.some((fs) => fs.sensorId === s.id));
    setSensorIdSelect(next != null ? String(next.id) : '');
  };

  const removeSensor = (id: number) => {
    const updated = formSensores.filter((s) => s.sensorId !== id);
    setFormSensores(updated);
    if (!sensorIdSelect) setSensorIdSelect(String(id));
  };

  // --- Create ---
  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setIsCreating(true);
    try {
      const data: CreateCellWithSensorsDto = {
        description: description.trim(),
        latitude,
        longitude,
        active: true,
        sensors: formSensores.map((s) => ({ sensorDbId: s.sensorId })),
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

  // --- Edit ---
  const handleOpenEditModal = (celda: Celda) => {
    setEditingCelda(celda);
    setEditDescription(celda.nombre);
    setEditLatitude(String(celda.ubicacion.lat));
    setEditLongitude(String(celda.ubicacion.lng));
    setEditErrors({});
    const currentSensors = sensoresDisponibles.filter((s) => s.cellId === celda.id);
    setEditFormSensors(currentSensors);
    const firstAvailable = sensoresDisponibles.find(
      (s) => s.cellId == null && !currentSensors.some((cs) => cs.id === s.id),
    );
    setEditSensorSelect(firstAvailable != null ? String(firstAvailable.id) : '');
    setIsEditModalOpen(true);
  };

  const editAvailableSensors = sensoresDisponibles.filter(
    (s) =>
      (s.cellId == null || s.cellId === editingCelda?.id) &&
      !editFormSensors.some((es) => es.id === s.id),
  );

  const addSensorToEdit = () => {
    const id = parseInt(editSensorSelect);
    if (isNaN(id) || editFormSensors.some((s) => s.id === id)) return;
    const sensor = sensoresDisponibles.find((s) => s.id === id);
    if (!sensor) return;
    const updated = [...editFormSensors, sensor];
    setEditFormSensors(updated);
    const next = sensoresDisponibles.find(
      (s) => (s.cellId == null || s.cellId === editingCelda?.id) && !updated.some((es) => es.id === s.id),
    );
    setEditSensorSelect(next != null ? String(next.id) : '');
  };

  const removeSensorFromEdit = (id: number) => {
    const updated = editFormSensors.filter((s) => s.id !== id);
    setEditFormSensors(updated);
    if (!editSensorSelect) setEditSensorSelect(String(id));
  };

  const handleEdit = async () => {
    if (!editingCelda || !validateEdit()) return;
    setIsEditing(true);
    try {
      await onUpdate({
        id: editingCelda.id,
        description: editDescription.trim(),
        latitude: editLatitude,
        longitude: editLongitude,
        active: editingCelda.activa,
        sensors: editFormSensors.map((s) => ({
          id: s.id,
          active: s.active,
          sensorHardwareRouteId: s.sensorHardwareRouteId,
          type: s.type,
          pollingTimeInterval: s.pollingTimeInterval,
          cellId: editingCelda.id,
        })),
      });
      setIsEditModalOpen(false);
      setEditingCelda(null);
      toaster.create({
        title: 'Celda actualizada',
        description: `"${editDescription.trim()}" se actualizó correctamente`,
        type: 'success',
      });
    } catch {
      // el error ya lo maneja el padre
    } finally {
      setIsEditing(false);
    }
  };

  // --- Single delete ---
  const handleOpenDeleteModal = (celda: Celda) => {
    setSelectedCelda(celda);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCelda) return;
    setIsDeleting(true);
    const nombre = selectedCelda.nombre;
    const id = selectedCelda.id;
    try {
      await onDelete(id);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setIsDeleteModalOpen(false);
      setSelectedCelda(null);
      toaster.create({
        title: 'Celda eliminada',
        description: `${nombre} fue eliminada correctamente`,
        type: 'info',
      });
    } catch {
      setIsDeleteModalOpen(false);
      setSelectedCelda(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Bulk delete ---
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    const count = selectedIds.size;
    try {
      await onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      toaster.create({
        title: 'Celdas eliminadas',
        description: `${count} celda${count !== 1 ? 's' : ''} eliminada${count !== 1 ? 's' : ''} correctamente`,
        type: 'info',
      });
    } catch {
      setIsBulkDeleteModalOpen(false);
    } finally {
      setIsBulkDeleting(false);
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
          {/* Header */}
          <HStack justify="space-between" mb={4}>
            <HStack gap={3}>
              {celdas.length > 0 && (
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1A202C' }}
                />
              )}
              <Box>
                <Text fontSize="lg" fontWeight="600">Gestión de Celdas</Text>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {celdas.length} celda{celdas.length !== 1 ? 's' : ''} configurada{celdas.length !== 1 ? 's' : ''}
                </Text>
              </Box>
            </HStack>
            <HStack gap={2}>
              {selectedIds.size > 0 && (
                <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm" bg="red.500" color="white"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    _hover={{ bg: 'red.600' }}
                  >
                    <FaTrash />
                    <Text ml={2}>Eliminar ({selectedIds.size})</Text>
                  </Button>
                </MotionBox>
              )}
              <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm" bg="brand.black" color="white" px={4}
                  onClick={handleOpenCreateModal} _hover={{ bg: 'gray.700' }}
                >
                  <FaPlus />
                  <Text ml={2}>Nueva Celda</Text>
                </Button>
              </MotionBox>
            </HStack>
          </HStack>

          {/* Cell list */}
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
                >
                  <HStack
                    bg={selectedIds.has(celda.id) ? 'blue.50' : 'gray.100'}
                    p={3} borderRadius="md" justify="space-between"
                    borderWidth="1px"
                    borderColor={selectedIds.has(celda.id) ? 'blue.200' : 'transparent'}
                    _hover={{ bg: selectedIds.has(celda.id) ? 'blue.100' : 'gray.200' }}
                    transition="all 0.2s ease"
                  >
                    <HStack gap={3}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(celda.id)}
                        onChange={() => toggleSelect(celda.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1A202C' }}
                      />
                      <VStack align="start" gap={0}>
                        <Text fontWeight="600" fontSize="sm">{celda.nombre}</Text>
                        <HStack gap={3}>
                          <Text fontSize="xs" color="gray.500">{celda.sensores.length} sensor{celda.sensores.length !== 1 ? 'es' : ''}</Text>
                          <Text fontSize="xs" color="gray.400">•</Text>
                          <Text fontSize="xs" color="gray.500">
                            {celda.ubicacion.lat.toFixed(4)}, {celda.ubicacion.lng.toFixed(4)}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <HStack gap={1}>
                      <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <IconButton
                          aria-label="Editar celda" size="sm"
                          colorPalette="blue" variant="ghost"
                          onClick={() => handleOpenEditModal(celda)}
                        >
                          <FaEdit />
                        </IconButton>
                      </MotionBox>
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
                  </HStack>
                </MotionBox>
              ))
            )}
          </VStack>
        </Box>
      </MotionBox>

      {/* ── Modal: Crear Celda ── */}
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
              bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="xl"
              w={{ base: '95vw', md: '520px' }} maxH="90vh" overflowY="auto"
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
                        disabled={availableSensors.length === 0}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#EDF2F7',
                          fontSize: '14px',
                          cursor: availableSensors.length === 0 ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          color: '#1A202C',
                        }}
                      >
                        {availableSensors.map((s) => (
                          <option key={s.id} value={s.id}>
                            Sensor {s.id} — {s.type.description}
                          </option>
                        ))}
                        {availableSensors.length === 0 && (
                          <option>Sin sensores disponibles</option>
                        )}
                      </select>
                    </Box>
                    <Button
                      size="sm" bg="brand.black" color="white"
                      onClick={addSensor}
                      disabled={availableSensors.length === 0 || isCreating}
                      _hover={{ bg: 'gray.700' }}
                    >
                      <FaPlus />
                    </Button>
                  </HStack>

                  {formSensores.length > 0 && (
                    <VStack gap={1} align="stretch">
                      {formSensores.map((s) => {
                        const full = sensoresDisponibles.find((sd) => sd.id === s.sensorId);
                        return (
                          <HStack
                            key={s.sensorId}
                            bg="gray.100" px={3} py={1.5} borderRadius="md"
                            justify="space-between"
                          >
                            <HStack gap={2}>
                              <FaMicrochip size={12} color="#718096" />
                              <VStack align="start" gap={0}>
                                <Text fontSize="sm">Sensor {s.sensorId}</Text>
                                {full && (
                                  <Text fontSize="xs" color="gray.500">{full.type.description}</Text>
                                )}
                              </VStack>
                            </HStack>
                            <IconButton
                              aria-label="Quitar sensor" size="xs"
                              variant="ghost" colorPalette="red"
                              onClick={() => removeSensor(s.sensorId)}
                            >
                              <FaTimes size={10} />
                            </IconButton>
                          </HStack>
                        );
                      })}
                    </VStack>
                  )}

                  {formSensores.length === 0 && (
                    <Text fontSize="xs" color="gray.400">
                      {sensoresDisponibles.length === 0
                        ? 'No hay sensores sin celda asignada disponibles.'
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

      {/* ── Modal: Editar Celda ── */}
      {isEditModalOpen && editingCelda && (
        <Box
          position="fixed" top={0} left={0} right={0} bottom={0}
          bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
          zIndex={1000}
          onClick={() => !isEditing && setIsEditModalOpen(false)}
        >
          <MotionBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="xl"
              w={{ base: '95vw', md: '520px' }} maxH="90vh" overflowY="auto"
            >
              <Text fontSize="lg" fontWeight="600" mb={5}>Editar Celda</Text>

              <VStack gap={4} align="stretch">
                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="600">Nombre</Text>
                  <Input
                    placeholder="Ej: Celda Bariloche Norte"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onBlur={validateEdit}
                    {...inputStyle(!!editErrors.description)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                  />
                  {editErrors.description && (
                    <Text fontSize="xs" color="red.500">{editErrors.description}</Text>
                  )}
                </Stack>

                <HStack gap={3} align="start">
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" fontWeight="600">Latitud</Text>
                    <Input
                      placeholder="-41.1335"
                      value={editLatitude}
                      onChange={(e) => setEditLatitude(e.target.value)}
                      onBlur={validateEdit}
                      {...inputStyle(!!editErrors.latitude)}
                    />
                    {editErrors.latitude && (
                      <Text fontSize="xs" color="red.500">{editErrors.latitude}</Text>
                    )}
                  </Stack>
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" fontWeight="600">Longitud</Text>
                    <Input
                      placeholder="-71.3103"
                      value={editLongitude}
                      onChange={(e) => setEditLongitude(e.target.value)}
                      onBlur={validateEdit}
                      {...inputStyle(!!editErrors.longitude)}
                    />
                    {editErrors.longitude && (
                      <Text fontSize="xs" color="red.500">{editErrors.longitude}</Text>
                    )}
                  </Stack>
                </HStack>

                {/* Sensores */}
                <Stack gap={2}>
                  <Text fontSize="sm" fontWeight="600">Sensores</Text>
                  <HStack gap={2}>
                    <Box flex={1}>
                      <select
                        value={editSensorSelect}
                        onChange={(e) => setEditSensorSelect(e.target.value)}
                        disabled={editAvailableSensors.length === 0}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#EDF2F7',
                          fontSize: '14px',
                          cursor: editAvailableSensors.length === 0 ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          color: '#1A202C',
                        }}
                      >
                        {editAvailableSensors.map((s) => (
                          <option key={s.id} value={s.id}>
                            Sensor {s.id} — {s.type.description}
                          </option>
                        ))}
                        {editAvailableSensors.length === 0 && (
                          <option>Sin sensores disponibles</option>
                        )}
                      </select>
                    </Box>
                    <Button
                      size="sm" bg="brand.black" color="white"
                      onClick={addSensorToEdit}
                      disabled={editAvailableSensors.length === 0 || isEditing}
                      _hover={{ bg: 'gray.700' }}
                    >
                      <FaPlus />
                    </Button>
                  </HStack>

                  {editFormSensors.length > 0 ? (
                    <VStack gap={1} align="stretch">
                      {editFormSensors.map((s) => (
                        <HStack
                          key={s.id}
                          bg="gray.100" px={3} py={1.5} borderRadius="md"
                          justify="space-between"
                        >
                          <HStack gap={2}>
                            <FaMicrochip size={12} color="#718096" />
                            <VStack align="start" gap={0}>
                              <Text fontSize="sm">Sensor {s.id}</Text>
                              <Text fontSize="xs" color="gray.500">{s.type.description}</Text>
                            </VStack>
                          </HStack>
                          <IconButton
                            aria-label="Quitar sensor" size="xs"
                            variant="ghost" colorPalette="red"
                            onClick={() => removeSensorFromEdit(s.id)}
                          >
                            <FaTimes size={10} />
                          </IconButton>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text fontSize="xs" color="gray.400">Sin sensores asignados.</Text>
                  )}
                </Stack>
              </VStack>

              <HStack gap={3} mt={6}>
                <Button
                  variant="ghost" flex={1}
                  onClick={() => { setIsEditModalOpen(false); setEditingCelda(null); }}
                  disabled={isEditing}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full" bg="brand.black" color="white"
                    onClick={handleEdit} loading={isEditing} disabled={isEditing}
                    _hover={{ bg: 'gray.700' }}
                  >
                    Guardar
                  </Button>
                </MotionBox>
              </HStack>
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* ── Modal: Confirmar Eliminación Individual ── */}
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
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="xl" w={{ base: '90vw', md: '400px' }}>
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

      {/* ── Modal: Confirmar Eliminación Masiva ── */}
      {isBulkDeleteModalOpen && (
        <Box
          position="fixed" top={0} left={0} right={0} bottom={0}
          bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
          zIndex={1000}
          onClick={() => !isBulkDeleting && setIsBulkDeleteModalOpen(false)}
        >
          <MotionBox
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="xl" w={{ base: '90vw', md: '400px' }}>
              <Flex align="center" gap={3} mb={4}>
                <Box
                  bg="red.100" borderRadius="full" p={2}
                  display="flex" alignItems="center" justifyContent="center"
                >
                  <FaExclamationTriangle color="#E53E3E" size={20} />
                </Box>
                <Text fontSize="lg" fontWeight="600">Eliminar {selectedIds.size} celda{selectedIds.size !== 1 ? 's' : ''}</Text>
              </Flex>

              <Text fontSize="sm" color="gray.600" mb={4}>
                ¿Estás seguro que deseas eliminar las {selectedIds.size} celdas seleccionadas?
                Esta acción no se puede deshacer.
              </Text>

              <HStack gap={3}>
                <Button
                  variant="ghost" flex={1}
                  onClick={() => setIsBulkDeleteModalOpen(false)} disabled={isBulkDeleting}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full" bg="red.500" color="white"
                    onClick={handleBulkDelete} loading={isBulkDeleting} disabled={isBulkDeleting}
                    _hover={{ bg: 'red.600' }}
                  >
                    Eliminar todas
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

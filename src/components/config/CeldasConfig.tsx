import { Box, Text, VStack, HStack, Button, IconButton, Input, Stack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { FaTimes, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

interface CeldasConfigProps {
  celdas: Celda[];
  onDelete: (id: number) => void;
  onCreate: (nombre: string) => void;
}

const CeldasConfig = ({ celdas, onDelete, onCreate }: CeldasConfigProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCelda, setSelectedCelda] = useState<Celda | null>(null);
  const [nombreNueva, setNombreNueva] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const validateNombre = (value: string): boolean => {
    if (!value.trim()) {
      setNombreError('El nombre de la celda es requerido');
      return false;
    }
    if (value.length < 3) {
      setNombreError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (value.length > 50) {
      setNombreError('El nombre no puede tener más de 50 caracteres');
      return false;
    }
    setNombreError('');
    return true;
  };

  const handleOpenCreateModal = () => {
    setNombreNueva('');
    setNombreError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenDeleteModal = (celda: Celda) => {
    setSelectedCelda(celda);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = async () => {
    if (!validateNombre(nombreNueva)) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreate(nombreNueva);
      setNombreNueva('');
      setIsCreateModalOpen(false);

      toaster.create({
        title: 'Celda creada',
        description: `La celda "${nombreNueva}" se creó exitosamente`,
        type: 'success',
      });
    } finally {
      setIsCreating(false);
    }
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

  return (
    <>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Box
          bg="white"
          p={6}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <HStack justify="space-between" mb={4}>
            <Box>
              <Text fontSize="lg" fontWeight="600">
                Gestión de Celdas
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {celdas.length} celda{celdas.length !== 1 ? 's' : ''} configurada{celdas.length !== 1 ? 's' : ''}
              </Text>
            </Box>
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                bg="brand.black"
                color="white"
                onClick={handleOpenCreateModal}
                _hover={{
                  bg: 'gray.700',
                }}
              >
                <FaPlus />
                <Text ml={2}>Nueva Celda</Text>
              </Button>
            </MotionBox>
          </HStack>

          <VStack gap={2} align="stretch">
            {celdas.length === 0 ? (
              <Box
                bg="gray.50"
                p={8}
                borderRadius="md"
                textAlign="center"
              >
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
                    bg="gray.100"
                    p={3}
                    borderRadius="md"
                    justify="space-between"
                    _hover={{ bg: 'gray.200' }}
                    transition="all 0.3s ease"
                  >
                    <VStack align="start" gap={0}>
                      <Text fontWeight="600" fontSize="sm">
                        {celda.nombre}
                      </Text>
                      <HStack gap={3}>
                        <Text fontSize="xs" color="gray.500">
                          {celda.sensores.length} sensores
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          •
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {celda.timestamp}
                        </Text>
                      </HStack>
                    </VStack>
                    <MotionBox whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton
                        aria-label="Eliminar celda"
                        size="sm"
                        colorPalette="red"
                        variant="ghost"
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
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
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
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="md"
              w="400px"
            >
              <Text fontSize="lg" fontWeight="600" mb={4}>
                Crear Nueva Celda
              </Text>

              <Stack gap={2} mb={4}>
                <Text fontSize="sm" fontWeight="600">
                  Nombre de la Celda
                </Text>
                <Input
                  placeholder="Ej: Celda Bariloche Norte"
                  value={nombreNueva}
                  onChange={(e) => {
                    setNombreNueva(e.target.value);
                    if (nombreError) validateNombre(e.target.value);
                  }}
                  onBlur={() => validateNombre(nombreNueva)}
                  bg="gray.100"
                  borderWidth={nombreError ? '2px' : '0'}
                  borderColor={nombreError ? 'red.500' : 'transparent'}
                  _hover={{ bg: 'gray.200' }}
                  _focus={{ 
                    bg: 'white', 
                    borderColor: nombreError ? 'red.500' : 'brand.orange', 
                    borderWidth: '2px' 
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !nombreError) {
                      handleCreate();
                    }
                  }}
                />
                {nombreError && (
                  <Text fontSize="xs" color="red.500">
                    {nombreError}
                  </Text>
                )}
              </Stack>

              <HStack gap={3}>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                  flex={1}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full"
                    bg="brand.black"
                    color="white"
                    onClick={handleCreate}
                    loading={isCreating}
                    disabled={isCreating}
                    _hover={{
                      bg: 'gray.700',
                    }}
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
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
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
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="xl"
              maxW="md"
              w="400px"
            >
              <Flex align="center" gap={3} mb={4}>
                <Box
                  bg="red.100"
                  borderRadius="full"
                  p={2}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FaExclamationTriangle color="#E53E3E" size={20} />
                </Box>
                <Text fontSize="lg" fontWeight="600">
                  Confirmar Eliminación
                </Text>
              </Flex>

              <Text fontSize="sm" color="gray.600" mb={4}>
                ¿Estás seguro que deseas eliminar la celda{' '}
                <Text as="span" fontWeight="600">
                  {selectedCelda.nombre}
                </Text>
                ? Esta acción no se puede deshacer.
              </Text>

              <Box bg="gray.50" p={3} borderRadius="md" mb={4}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Información de la celda:
                </Text>
                <Text fontSize="xs" color="gray.700">
                  • Sensores: {selectedCelda.sensores.length}
                </Text>
                <Text fontSize="xs" color="gray.700">
                  • Estado: {selectedCelda.activa ? 'Activa' : 'Inactiva'}
                </Text>
              </Box>

              <HStack gap={3}>
                <Button
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  flex={1}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <MotionBox flex={1} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    w="full"
                    bg="red.500"
                    color="white"
                    onClick={handleDelete}
                    loading={isDeleting}
                    disabled={isDeleting}
                    _hover={{
                      bg: 'red.600',
                    }}
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

// Import faltante
import { Flex } from '@chakra-ui/react';

export default CeldasConfig;
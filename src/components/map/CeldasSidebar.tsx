import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface CeldasSidebarProps {
  celdas: Celda[];
  onCeldaClick?: (celda: Celda) => void;
}

const CeldasSidebar = ({ celdas, onCeldaClick }: CeldasSidebarProps) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCeldaClick = (celda: Celda) => {
    if (onCeldaClick) {
      onCeldaClick(celda);
    }
  };

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      h="600px"
      overflowY="auto"
    >
      <Text fontSize="lg" fontWeight="600" mb={4}>
        Lista de Celdas
      </Text>

      <VStack gap={2} align="stretch">
        {celdas.map((celda, index) => {
          const isExpanded = expandedIds.includes(celda.id);
          const hasAlert = celda.sensores.some((s) => s.enFuego);
          
          return (
            <MotionBox
              key={celda.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: -4 }}
            >
              <Box>
                <HStack
                  bg="gray.100"
                  _hover={{ bg: 'gray.200' }}
                  borderRadius="md"
                  p={3}
                  cursor="pointer"
                  onClick={() => handleCeldaClick(celda)}
                  justify="space-between"
                >
                  <HStack gap={3}>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={hasAlert ? 'brand.orange' : 'green.400'}
                    />
                    <VStack align="start" gap={0}>
                      <Text fontWeight="600" fontSize="sm">
                        {celda.nombre}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {celda.timestamp}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(celda.id);
                    }}
                    p={2}
                  >
                    <Text fontSize="xs">{isExpanded ? '▲' : '▼'}</Text>
                  </Box>
                </HStack>

                {isExpanded && (
                  <Box bg="white" p={3} mt={1}>
                    <VStack align="start" gap={1}>
                      <Text fontSize="xs" color="gray.500">
                        Sensores: {celda.sensores.length}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Temp. Promedio:{' '}
                        {Math.round(
                          celda.sensores.reduce((acc, s) => acc + s.temperatura, 0) /
                            celda.sensores.length
                        )}
                        °C
                      </Text>
                      {hasAlert && (
                        <Text fontSize="xs" color="red.500" fontWeight="600">
                          ⚠️ Alerta de incendio activa
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>
            </MotionBox>
          );
        })}
      </VStack>
    </Box>
  );
};

export default CeldasSidebar;
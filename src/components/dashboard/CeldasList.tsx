import { Box, Text, VStack, HStack } from '@chakra-ui/react';
//import { Accordion } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Celda } from '../../types';
import { useState } from 'react';

const MotionBox = motion.create(Box);

interface CeldasListProps {
  celdas: Celda[];
}

const CeldasList = ({ celdas }: CeldasListProps) => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <Text fontSize="lg" fontWeight="600" mb={4}>
          Estado de las celdas
        </Text>

        <VStack gap={2} align="stretch">
          {celdas.map((celda, index) => {
            const isExpanded = expandedIds.includes(celda.id);
            return (
              <MotionBox
                key={celda.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Box>
                  <HStack
                    bg="gray.100"
                    _hover={{ bg: 'gray.200' }}
                    borderRadius="md"
                    py={3}
                    px={4}
                    cursor="pointer"
                    onClick={() => toggleExpand(celda.id)}
                    justify="space-between"
                  >
                    <HStack gap={3}>
                      <Box
                        w={3}
                        h={3}
                        borderRadius="full"
                        bg={celda.activa ? 'green.400' : 'brand.orange'}
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
                    <Text>{isExpanded ? '▲' : '▼'}</Text>
                  </HStack>

                  {isExpanded && (
                    <Box bg="white" p={4} mt={1} borderRadius="md">
                      <VStack align="stretch" gap={2}>
                        {celda.sensores.map((sensor) => (
                          <HStack key={sensor.id} justify="space-between" fontSize="sm">
                            <Text>Sensor {sensor.id}</Text>
                            <Text>{sensor.temperatura}°C</Text>
                            <Text color={sensor.enFuego ? 'red.500' : 'green.400'}>
                              {sensor.enFuego ? 'SÍ' : 'NO'}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </Box>
              </MotionBox>
            );
          })}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default CeldasList;
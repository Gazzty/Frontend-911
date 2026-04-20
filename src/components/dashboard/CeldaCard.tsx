import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface CeldaCardProps {
  celda: Celda;
  index: number;
}

const CeldaCard = ({ celda, index }: CeldaCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <MotionBox
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
          onClick={() => setIsExpanded(!isExpanded)}
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
          <Box bg="white" p={4} mt={1} borderRadius="md" borderWidth="1px" borderColor="gray.100">
            <VStack align="stretch" gap={2}>
              <HStack justify="space-between" fontSize="xs" color="gray.500" fontWeight="700" textTransform="uppercase" letterSpacing="wide" pb={1} borderBottom="1px solid" borderColor="gray.200">
                <Text>ID Sensor</Text>
                <Text>Temperatura</Text>
                <Text>Incendio</Text>
              </HStack>
              {celda.sensores.map((sensor) => (
                <HStack key={sensor.id} justify="space-between" fontSize="sm">
                  <Text>Sensor {sensor.id}</Text>
                  <Text>{sensor.temperatura}°C</Text>
                  <Text color={sensor.enFuego ? 'red.500' : 'green.400'} fontWeight={sensor.enFuego ? "bold" : "normal"}>
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
};

export default CeldaCard;

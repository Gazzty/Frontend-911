import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface AlertasRecientesProps {
  celdas: Celda[];
}

interface Alerta {
  celda: Celda;
  temperatura: number;
  timestamp: string;
}

const AlertasRecientes = ({ celdas }: AlertasRecientesProps) => {
  // Generar alertas desde las celdas con sensores en fuego
  const alertas: Alerta[] = [];
  
  celdas.forEach((celda) => {
    celda.sensores.forEach((sensor) => {
      if (sensor.enFuego) {
        alertas.push({
          celda,
          temperatura: sensor.temperatura,
          timestamp: celda.timestamp,
        });
      }
    });
  });

  // Limitar a 3 alertas más recientes
  const alertasRecientes = alertas.slice(0, 3);

  if (alertasRecientes.length === 0) {
    return null;
  }

  const formatFecha = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} a las ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
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
          Alertas recientes
        </Text>

        <VStack gap={3} align="stretch">
          {alertasRecientes.map((alerta, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <Box
                bg="red.50"
                p={4}
                borderRadius="md"
                borderWidth="1px"
                borderColor="red.200"
                transition="all 0.3s ease"
                _hover={{
                  bg: 'red.100',
                  borderColor: 'red.300',
                }}
              >
                <Flex align="center" justify="space-between">
                  <HStack gap={3} flex={1}>
                    <Box
                      bg="red.500"
                      borderRadius="full"
                      p={2}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FaExclamationTriangle color="white" size={16} />
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="600" color="red.900">
                        {alerta.celda.nombre}
                      </Text>
                      <Text fontSize="xs" color="red.700">
                        {formatFecha()}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600" color="red.700">
                    Temperatura crítica detectada: {alerta.temperatura}°C
                  </Text>
                </Flex>
              </Box>
            </MotionBox>
          ))}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default AlertasRecientes;
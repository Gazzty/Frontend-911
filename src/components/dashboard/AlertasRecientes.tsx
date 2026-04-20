import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Celda } from '../../types';
import AlertaCard, { AlertaData } from './AlertaCard';

const MotionBox = motion.create(Box);

interface AlertasRecientesProps {
  celdas: Celda[];
}

const AlertasRecientes = ({ celdas }: AlertasRecientesProps) => {
  // Generar alertas desde las celdas con sensores en fuego
  const alertas: AlertaData[] = [];
  
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
            <AlertaCard key={`${alerta.celda.id}-${index}`} alerta={alerta} index={index} />
          ))}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default AlertasRecientes;
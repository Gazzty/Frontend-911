import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getLastEventsByTypes, type EventLogItem } from '../../api/eventsLogApi';
import AlertaCard from './AlertaCard';

const MotionBox = motion.create(Box);

const ALERT_TYPES = [2, 4]; // Fire, WarningFire

interface AlertasRecientesProps {
  refreshKey?: number;
}

const AlertasRecientes = ({ refreshKey = 0 }: AlertasRecientesProps) => {
  const [alertas, setAlertas] = useState<EventLogItem[]>([]);

  useEffect(() => {
    getLastEventsByTypes({ eventTypes: ALERT_TYPES, last: 10 })
      .then((res) => {
        if (res.success && res.payload) {
          setAlertas(res.payload.filter((a) => ALERT_TYPES.includes(a.alertLogTypeId)));
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  if (alertas.length === 0) return null;

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
          {alertas.map((alerta, index) => (
            <AlertaCard key={`${alerta.alertLogTypeId}-${alerta.date}-${index}`} alerta={alerta} index={index} />
          ))}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default AlertasRecientes;

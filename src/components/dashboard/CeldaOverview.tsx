import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Celda } from '../../types';
import CeldaCard from './CeldaCard';

const MotionBox = motion.create(Box);

interface CeldaOverviewProps {
  celdas: Celda[];
}

const CeldaOverview = ({ celdas }: CeldaOverviewProps) => {
  const celdasActivas = celdas.filter((c) => c.activa);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Box
        bg="bg.default"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="border.default"
      >
        <Text fontSize="lg" fontWeight="600" mb={4}>
          Resumen de Celdas Activas ({celdasActivas.length})
        </Text>

        <VStack gap={2} align="stretch">
          {celdasActivas.length > 0 ? (
            celdasActivas.map((celda, index) => (
              <CeldaCard key={celda.id} celda={celda} index={index} />
            ))
          ) : (
            <Text color="fg.muted" textAlign="center" py={4}>
              No hay celdas activas actualmente
            </Text>
          )}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default CeldaOverview;

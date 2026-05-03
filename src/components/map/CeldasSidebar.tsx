import { Box, Text, VStack } from '@chakra-ui/react';
import type { Celda } from '../../types';
import CeldaCard from '../dashboard/CeldaCard';

interface CeldasSidebarProps {
  celdas: Celda[];
  onCeldaClick?: (celda: Celda) => void;
}

const CeldasSidebar = ({ celdas, onCeldaClick }: CeldasSidebarProps) => {
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

      <VStack gap={0} align="stretch">
        {celdas.map((celda, index) => (
          <CeldaCard 
            key={celda.id} 
            celda={celda} 
            index={index} 
            onClick={onCeldaClick} 
          />
        ))}
      </VStack>
    </Box>
  );
};

export default CeldasSidebar;
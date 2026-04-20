import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Celda } from '../../types';
import CeldaCard from './CeldaCard';

const MotionBox = motion.create(Box);

interface CeldasListProps {
  celdas: Celda[];
}

const CeldasList = ({ celdas }: CeldasListProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      h="100%"
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        h="100%"
        display="flex"
        flexDirection="column"
      >
        <Text fontSize="lg" fontWeight="600" mb={4}>
          Estado de las celdas
        </Text>

        <VStack
          gap={2}
          align="stretch"
          flex={1}
          overflowY="auto"
          pr={1}
          css={{
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': { background: '#A0AEC0' },
          }}
        >
          {celdas.map((celda, index) => (
            <CeldaCard key={celda.id} celda={celda} index={index} />
          ))}
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default CeldasList;
import { Box, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface CeldaCardProps {
  celda: Celda;
  index: number;
  onClick?: (celda: Celda) => void;
}

const CeldaCard = ({ celda, index, onClick }: CeldaCardProps) => {
  const sensor = celda.sensores[0];

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Box mb={2}>
        <HStack
          bg="gray.100"
          _hover={{ bg: 'gray.200' }}
          borderRadius="md"
          py={3}
          px={4}
          cursor={onClick ? 'pointer' : 'default'}
          onClick={() => onClick && onClick(celda)}
          justify="space-between"
        >
          <HStack gap={3}>
            <Box
              w={3}
              h={3}
              borderRadius="full"
              bg={sensor?.enFuego ? 'brand.orange' : (celda.activa ? 'green.400' : 'gray.400')}
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
          
          <HStack gap={4}>
            {sensor && (
              <>
                <Text fontWeight="bold" fontSize="sm">
                  {sensor.temperatura}°C
                </Text>
                {sensor.enFuego ? (
                  <Badge colorPalette="red" bg="red.500" color="white" px={2} py={0.5} borderRadius="md" fontSize="xs">
                    FUEGO
                  </Badge>
                ) : (
                  <Badge colorPalette="green" bg="green.500" color="white" px={2} py={0.5} borderRadius="md" fontSize="xs">
                    NORMAL
                  </Badge>
                )}
              </>
            )}
          </HStack>
        </HStack>
      </Box>
    </MotionBox>
  );
};

export default CeldaCard;

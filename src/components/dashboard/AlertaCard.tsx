import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

export interface AlertaData {
  celda: Celda;
  temperatura: number;
  timestamp: string;
}

interface AlertaCardProps {
  alerta: AlertaData;
  index: number;
}

const AlertaCard = ({ alerta, index }: AlertaCardProps) => {
  const formatFecha = () => {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} a las ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <MotionBox
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
        <Flex
          align={{ base: 'flex-start', sm: 'center' }}
          justify="space-between"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 2, sm: 0 }}
        >
          <HStack gap={3} flex={1}>
            <Box
              bg="red.500"
              borderRadius="full"
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
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
          <Text fontSize="sm" fontWeight="600" color="red.700" flexShrink={0}>
            Temp. crítica: {alerta.temperatura}°C
          </Text>
        </Flex>
      </Box>
    </MotionBox>
  );
};

export default AlertaCard;

import { Box, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface FireAlertProps {
  celdasEnFuego: Celda[];
  onDismiss: () => void;
}

const FireAlert = ({ celdasEnFuego, onDismiss }: FireAlertProps) => {
  return (
    <AnimatePresence>
      {celdasEnFuego.length > 0 && (
        <MotionBox
          key="fire-alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0,0,0,0.85)"
        >
          {/* Fondo pulsante rojo */}
          <MotionBox
            position="absolute"
            inset={0}
            bg="red.600"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Contenido */}
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            position="relative"
            zIndex={1}
            bg="white"
            borderRadius="2xl"
            p={{ base: 8, md: 12 }}
            mx={4}
            maxW="560px"
            w="full"
            boxShadow="0 0 80px rgba(255, 50, 0, 0.6)"
            borderWidth="3px"
            borderColor="red.500"
            textAlign="center"
          >
            {/* Icono animado */}
            <MotionBox
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              display="inline-block"
              mb={4}
            >
              <Box
                bg="red.500"
                borderRadius="full"
                p={5}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                <FaFire color="white" size={48} />
              </Box>
            </MotionBox>

            <VStack gap={4}>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="red.700" lineHeight="1.2">
                ¡ALERTA DE INCENDIO!
              </Text>

              <Text fontSize="md" color="gray.600" fontWeight="500">
                {celdasEnFuego.length === 1
                  ? 'Se detectó un incendio en el siguiente sector:'
                  : `Se detectaron incendios en ${celdasEnFuego.length} sectores:`}
              </Text>

              {/* Lista de celdas */}
              <VStack gap={2} w="full">
                {celdasEnFuego.map((celda) => (
                  <HStack
                    key={celda.id}
                    bg="red.50"
                    borderWidth="1px"
                    borderColor="red.200"
                    borderRadius="lg"
                    px={4}
                    py={3}
                    w="full"
                    justify="center"
                    gap={2}
                  >
                    <FaMapMarkerAlt color="#E53E3E" size={16} />
                    <Text fontSize="lg" fontWeight="700" color="red.700">
                      {celda.nombre}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Text fontSize="sm" color="gray.500" mt={1}>
                Contacte a los servicios de emergencia inmediatamente.
              </Text>

              <Button
                mt={2}
                size="lg"
                colorPalette="red"
                variant="outline"
                onClick={onDismiss}
                w="full"
              >
                <FaTimes />
                <Text ml={2}>Entendido, cerrar alerta</Text>
              </Button>
            </VStack>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
};

export default FireAlert;

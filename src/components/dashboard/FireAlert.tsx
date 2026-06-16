import { Box, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface FireAlertProps {
  celdasEnFuego: Celda[];
  alertType?: 'fire' | 'warning';
  onDismiss: () => void;
}

const FIRE_THEME = {
  pulseBg: 'red.600',
  shadow: '0 0 80px rgba(255, 50, 0, 0.6)',
  border: 'red.500',
  iconBg: 'red.500',
  titleColor: 'red.700',
  title: '¡ALERTA DE INCENDIO!',
  cardBg: 'red.50',
  cardBorder: 'red.200',
  cardText: 'red.700',
  markerColor: '#E53E3E',
  palette: 'red',
  footer: 'Contacte a los servicios de emergencia inmediatamente.',
} as const;

const WARNING_THEME = {
  pulseBg: 'orange.500',
  shadow: '0 0 80px rgba(255, 140, 0, 0.6)',
  border: 'orange.400',
  iconBg: 'orange.500',
  titleColor: 'orange.700',
  title: 'ALERTA DE PROBABILIDAD DE INCENDIO',
  cardBg: 'orange.50',
  cardBorder: 'orange.200',
  cardText: 'orange.700',
  markerColor: '#DD6B20',
  palette: 'orange',
  footer: 'Monitoree la situación y prepare los protocolos de emergencia.',
} as const;

const FireAlert = ({ celdasEnFuego, alertType = 'fire', onDismiss }: FireAlertProps) => {
  const theme = alertType === 'fire' ? FIRE_THEME : WARNING_THEME;

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
          {/* Fondo pulsante */}
          <MotionBox
            position="absolute"
            inset={0}
            bg={theme.pulseBg}
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
            bg="bg.default"
            borderRadius="2xl"
            p={{ base: 8, md: 12 }}
            mx={4}
            maxW="560px"
            w="full"
            boxShadow={theme.shadow}
            borderWidth="3px"
            borderColor={theme.border}
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
                bg={theme.iconBg}
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
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={theme.titleColor} lineHeight="1.2">
                {theme.title}
              </Text>

              <Text fontSize="md" color="fg.muted" fontWeight="500">
                {celdasEnFuego.length === 1
                  ? 'Se detectó una alerta en el siguiente sector:'
                  : `Se detectaron alertas en ${celdasEnFuego.length} sectores:`}
              </Text>

              {/* Lista de celdas */}
              <VStack gap={2} w="full">
                {celdasEnFuego.map((celda) => (
                  <HStack
                    key={celda.id}
                    bg={theme.cardBg}
                    borderWidth="1px"
                    borderColor={theme.cardBorder}
                    borderRadius="lg"
                    px={4}
                    py={3}
                    w="full"
                    justify="center"
                    gap={2}
                  >
                    <FaMapMarkerAlt color={theme.markerColor} size={16} />
                    <Text fontSize="lg" fontWeight="700" color={theme.cardText}>
                      {celda.nombre}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Text fontSize="sm" color="fg.muted" mt={1}>
                {theme.footer}
              </Text>

              <Button
                mt={2}
                size="lg"
                colorPalette={theme.palette}
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

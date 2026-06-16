import type { ReactNode } from 'react';
import { Box, Text, VStack, Button, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTimes, FaMapMarkerAlt, FaThermometerHalf } from 'react-icons/fa';
import type { Celda } from '../../types';

const MotionBox = motion.create(Box);

interface FireAlertProps {
  celdasEnFuego: Celda[];
  celdasEnAlertaTemp: Celda[];
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
  title: 'ALERTA DE POSIBILIDAD DE INCENDIO',
  cardBg: 'orange.50',
  cardBorder: 'orange.200',
  cardText: 'orange.700',
  markerColor: '#DD6B20',
  palette: 'orange',
  footer: 'Monitoree la situación y prepare los protocolos de emergencia.',
} as const;

type Theme = typeof FIRE_THEME | typeof WARNING_THEME;

const AlertSection = ({
  theme,
  celdas,
  icon,
  compact,
}: {
  theme: Theme;
  celdas: Celda[];
  icon: ReactNode;
  compact: boolean;
}) => (
  <VStack gap={3} w="full">
    <MotionBox
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      display="inline-block"
    >
      <Box
        bg={theme.iconBg}
        borderRadius="full"
        p={compact ? 4 : 5}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </Box>
    </MotionBox>

    <Text
      fontSize={{ base: compact ? 'xl' : '2xl', md: compact ? '2xl' : '3xl' }}
      fontWeight="800"
      color={theme.titleColor}
      lineHeight="1.2"
    >
      {theme.title}
    </Text>

    <Text fontSize="sm" color="gray.600" fontWeight="500">
      {celdas.length === 1
        ? 'Se detectó una alerta en el siguiente sector:'
        : `Se detectaron alertas en ${celdas.length} sectores:`}
    </Text>

    <VStack gap={2} w="full">
      {celdas.map((celda) => (
        <HStack
          key={celda.id}
          bg={theme.cardBg}
          borderWidth="1px"
          borderColor={theme.cardBorder}
          borderRadius="lg"
          px={4}
          py={compact ? 2 : 3}
          w="full"
          justify="center"
          gap={2}
        >
          <FaMapMarkerAlt color={theme.markerColor} size={compact ? 14 : 16} />
          <Text fontSize={compact ? 'md' : 'lg'} fontWeight="700" color={theme.cardText}>
            {celda.nombre}
          </Text>
        </HStack>
      ))}
    </VStack>

    <Text fontSize="xs" color="gray.500" mt={1}>
      {theme.footer}
    </Text>
  </VStack>
);

const FireAlert = ({ celdasEnFuego, celdasEnAlertaTemp, onDismiss }: FireAlertProps) => {
  const hasFire = celdasEnFuego.length > 0;
  const hasTemp = celdasEnAlertaTemp.length > 0;
  const hasBoth = hasFire && hasTemp;

  const pulseBg = hasFire ? FIRE_THEME.pulseBg : WARNING_THEME.pulseBg;
  const shadow = hasFire ? FIRE_THEME.shadow : WARNING_THEME.shadow;
  const border = hasFire ? FIRE_THEME.border : WARNING_THEME.border;
  const palette = hasFire ? FIRE_THEME.palette : WARNING_THEME.palette;
  const iconSize = hasBoth ? 36 : 48;

  return (
    <AnimatePresence>
      {(hasFire || hasTemp) && (
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
          overflowY="auto"
          py={4}
        >
          {/* Fondo pulsante */}
          <MotionBox
            position="absolute"
            inset={0}
            bg={pulseBg}
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
            p={{ base: hasBoth ? 6 : 8, md: hasBoth ? 8 : 12 }}
            mx={4}
            maxW="560px"
            w="full"
            boxShadow={shadow}
            borderWidth="3px"
            borderColor={border}
            textAlign="center"
          >
            <VStack gap={4}>
              {hasFire && (
                <AlertSection
                  theme={FIRE_THEME}
                  celdas={celdasEnFuego}
                  compact={hasBoth}
                  icon={<FaFire color="white" size={iconSize} />}
                />
              )}

              {hasBoth && (
                <Box w="full" h="1px" bg="gray.200" />
              )}

              {hasTemp && (
                <AlertSection
                  theme={WARNING_THEME}
                  celdas={celdasEnAlertaTemp}
                  compact={hasBoth}
                  icon={<FaThermometerHalf color="white" size={iconSize} />}
                />
              )}

              <Button
                mt={2}
                size="lg"
                colorPalette={palette}
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

import { Box, Text, VStack, HStack, Input, Button, Stack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

interface NotificacionesConfigProps {
  email: boolean;
  emailDireccion: string;
  sms: boolean;
  telefono: string;
  onSave: (config: {
    email: boolean;
    emailDireccion: string;
    sms: boolean;
    telefono: string;
  }) => void;
}

const NotificacionesConfig = ({
  email: initialEmail,
  emailDireccion: initialEmailDir,
  sms: initialSms,
  telefono: initialTelefono,
  onSave,
}: NotificacionesConfigProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [emailDireccion, setEmailDireccion] = useState(initialEmailDir);
  const [sms, setSms] = useState(initialSms);
  const [telefono, setTelefono] = useState(initialTelefono);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  const validateEmail = (value: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('El email es requerido si las notificaciones por email están activadas');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateTelefono = (value: string): boolean => {
    if (!sms) return true;
    if (!value.trim()) {
      setTelefonoError('El teléfono es requerido si las notificaciones por SMS están activadas');
      return false;
    }
    if (value.length < 8) {
      setTelefonoError('El número de teléfono debe tener al menos 8 dígitos');
      return false;
    }
    setTelefonoError('');
    return true;
  };

  const handleSave = async () => {
    const isEmailValid = validateEmail(emailDireccion);
    const isTelefonoValid = validateTelefono(telefono);

    if (!isEmailValid || !isTelefonoValid) {
      toaster.create({
        title: 'Error de validación',
        description: 'Por favor corrige los errores antes de guardar',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ email, emailDireccion, sms, telefono });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    email !== initialEmail ||
    emailDireccion !== initialEmailDir ||
    sms !== initialSms ||
    telefono !== initialTelefono;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
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
          Configuración de Notificaciones
        </Text>

        <VStack gap={5} align="stretch">
          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="600">
                Notificaciones por Email
              </Text>
              <Box
                as="label"
                display="flex"
                alignItems="center"
                cursor="pointer"
              >
                <input
                  type="checkbox"
                  checked={email}
                  onChange={(e) => {
                    setEmail(e.target.checked);
                    if (!e.target.checked) setEmailError('');
                  }}
                  style={{
                    width: '44px',
                    height: '24px',
                    cursor: 'pointer',
                    accentColor: '#FF4500',
                  }}
                />
              </Box>
            </HStack>
            <Stack gap={1}>
              <Text fontSize="xs" color="fg.muted">Dirección de email</Text>
              <Input
                type="email"
                value={emailDireccion}
                onChange={(e) => {
                  setEmailDireccion(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(emailDireccion)}
                bg="bg.input"
                borderWidth={emailError ? '2px' : '0'}
                borderColor={emailError ? 'red.500' : 'transparent'}
                size="sm"
                disabled={!email}
                _hover={{ bg: 'bg.muted' }}
                _focus={{
                  bg: 'bg.default',
                  borderColor: emailError ? 'red.500' : 'brand.orange', 
                  borderWidth: '2px' 
                }}
                placeholder="ejemplo@correo.com"
              />
              {emailError && (
                <Text fontSize="xs" color="red.500">
                  {emailError}
                </Text>
              )}
            </Stack>
          </Box>

          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontSize="sm" fontWeight="600">
                Notificaciones por SMS
              </Text>
              <Box
                as="label"
                display="flex"
                alignItems="center"
                cursor="pointer"
              >
                <input
                  type="checkbox"
                  checked={sms}
                  onChange={(e) => {
                    setSms(e.target.checked);
                    if (!e.target.checked) setTelefonoError('');
                  }}
                  style={{
                    width: '44px',
                    height: '24px',
                    cursor: 'pointer',
                    accentColor: '#FF4500',
                  }}
                />
              </Box>
            </HStack>
            <Stack gap={1}>
              <Text fontSize="xs" color="fg.muted">Número de teléfono</Text>
              <Input
                type="tel"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  if (telefonoError) validateTelefono(e.target.value);
                }}
                onBlur={() => validateTelefono(telefono)}
                bg="bg.input"
                borderWidth={telefonoError ? '2px' : '0'}
                borderColor={telefonoError ? 'red.500' : 'transparent'}
                size="sm"
                disabled={!sms}
                _hover={{ bg: 'bg.muted' }}
                _focus={{
                  bg: 'bg.default',
                  borderColor: telefonoError ? 'red.500' : 'brand.orange', 
                  borderWidth: '2px' 
                }}
                placeholder="+54 9 11 1234-5678"
              />
              {telefonoError && (
                <Text fontSize="xs" color="red.500">
                  {telefonoError}
                </Text>
              )}
            </Stack>
          </Box>

          <MotionBox whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              w="full"
              bg="brand.black"
              color="white"
              onClick={handleSave}
              loading={isLoading}
              disabled={!hasChanges || isLoading}
              _hover={{
                bg: 'gray.700',
              }}
            >
              {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
            </Button>
          </MotionBox>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default NotificacionesConfig;
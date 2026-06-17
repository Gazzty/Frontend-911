import { Box, Text, VStack, HStack, Input, Button, IconButton, Stack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// El backend guarda las listas como un único string separado por ";".
const splitList = (value: string): string[] =>
  value
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean);

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
  const [emails, setEmails] = useState<string[]>(splitList(initialEmailDir));
  const [emailInput, setEmailInput] = useState('');
  const [sms, setSms] = useState(initialSms);
  const [telefonos, setTelefonos] = useState<string[]>(splitList(initialTelefono));
  const [telefonoInput, setTelefonoInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  const addEmail = () => {
    const value = emailInput.trim();
    if (!value) return;
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Ingresa un email válido');
      return;
    }
    if (emails.includes(value)) {
      setEmailError('Ese email ya fue agregado');
      return;
    }
    setEmails((prev) => [...prev, value]);
    setEmailInput('');
    setEmailError('');
  };

  const removeEmail = (value: string) => {
    setEmails((prev) => prev.filter((e) => e !== value));
  };

  const addTelefono = () => {
    const value = telefonoInput.trim();
    if (!value) return;
    if (value.length < 8) {
      setTelefonoError('El número de teléfono debe tener al menos 8 dígitos');
      return;
    }
    if (telefonos.includes(value)) {
      setTelefonoError('Ese teléfono ya fue agregado');
      return;
    }
    setTelefonos((prev) => [...prev, value]);
    setTelefonoInput('');
    setTelefonoError('');
  };

  const removeTelefono = (value: string) => {
    setTelefonos((prev) => prev.filter((t) => t !== value));
  };

  const validateEmails = (): boolean => {
    if (!email) return true;
    if (emails.length === 0) {
      setEmailError('Agrega al menos un email si las notificaciones por email están activadas');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateTelefonos = (): boolean => {
    if (!sms) return true;
    if (telefonos.length === 0) {
      setTelefonoError('Agrega al menos un teléfono si las notificaciones por SMS están activadas');
      return false;
    }
    setTelefonoError('');
    return true;
  };

  const handleSave = async () => {
    const isEmailValid = validateEmails();
    const isTelefonoValid = validateTelefonos();

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
      await onSave({
        email,
        emailDireccion: emails.join(';'),
        sms,
        telefono: telefonos.join(';'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    email !== initialEmail ||
    sms !== initialSms ||
    emails.join(';') !== splitList(initialEmailDir).join(';') ||
    telefonos.join(';') !== splitList(initialTelefono).join(';');

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
              <Text fontSize="xs" color="fg.muted">Direcciones de email</Text>
              <HStack>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEmail();
                    }
                  }}
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
                <Button
                  size="sm" bg="brand.black" color="white"
                  onClick={addEmail}
                  disabled={!email || !emailInput.trim()}
                  _hover={{ bg: 'gray.700' }}
                >
                  <FaPlus />
                </Button>
              </HStack>
              {emailError && (
                <Text fontSize="xs" color="red.500">
                  {emailError}
                </Text>
              )}
              {emails.length > 0 && (
                <VStack gap={1} align="stretch" mt={1}>
                  {emails.map((value) => (
                    <HStack
                      key={value}
                      bg="bg.muted" px={3} py={1.5} borderRadius="md"
                      justify="space-between"
                    >
                      <Text fontSize="sm">{value}</Text>
                      <IconButton
                        aria-label="Quitar email" size="xs"
                        variant="ghost" colorPalette="red"
                        onClick={() => removeEmail(value)}
                        disabled={!email}
                      >
                        <FaTimes size={10} />
                      </IconButton>
                    </HStack>
                  ))}
                </VStack>
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
              <Text fontSize="xs" color="fg.muted">Números de teléfono</Text>
              <HStack>
                <Input
                  type="tel"
                  value={telefonoInput}
                  onChange={(e) => {
                    setTelefonoInput(e.target.value);
                    if (telefonoError) setTelefonoError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTelefono();
                    }
                  }}
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
                <Button
                  size="sm" bg="brand.black" color="white"
                  onClick={addTelefono}
                  disabled={!sms || !telefonoInput.trim()}
                  _hover={{ bg: 'gray.700' }}
                >
                  <FaPlus />
                </Button>
              </HStack>
              {telefonoError && (
                <Text fontSize="xs" color="red.500">
                  {telefonoError}
                </Text>
              )}
              {telefonos.length > 0 && (
                <VStack gap={1} align="stretch" mt={1}>
                  {telefonos.map((value) => (
                    <HStack
                      key={value}
                      bg="bg.muted" px={3} py={1.5} borderRadius="md"
                      justify="space-between"
                    >
                      <Text fontSize="sm">{value}</Text>
                      <IconButton
                        aria-label="Quitar teléfono" size="xs"
                        variant="ghost" colorPalette="red"
                        onClick={() => removeTelefono(value)}
                        disabled={!sms}
                      >
                        <FaTimes size={10} />
                      </IconButton>
                    </HStack>
                  ))}
                </VStack>
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

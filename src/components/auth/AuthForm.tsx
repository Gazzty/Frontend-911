import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFire, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Box, Container, VStack, Text, Input, Button, Link, Stack, IconButton } from '@chakra-ui/react';
import { ColorModeButton } from '../ui/color-mode';

const MotionBox = motion.create(Box);

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: AuthFormData) => void;
  isLoading: boolean;
  error?: string | null;
  onNavigate: () => void;
}

const AuthForm = ({ type, onSubmit, isLoading, error, onNavigate }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');

  const isLogin = type === 'login';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('El email es requerido');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un email válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateName = (name: string): boolean => {
    if (!isLogin && !name.trim()) {
      setNameError('El nombre es requerido');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isNameValid = validateName(name);

    if (!isEmailValid || !isPasswordValid || (!isLogin && !isNameValid)) {
      return;
    }

    onSubmit({ email, password, ...(isLogin ? {} : { name }) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box
      minH="100vh"
      bg="bg.page"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >

      <Container maxW="md">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            bg="bg.default"
            p={{ base: 6, md: 10 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="border.default"
            position="relative"
          >
            <Box position="absolute" top={3} right={3}>
              <ColorModeButton />
            </Box>
            <VStack gap={6}>
              <MotionBox
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Box
                  bg="brand.orange"
                  borderRadius="full"
                  p={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FaFire color="white" size={32} />
                </Box>
              </MotionBox>

              <VStack gap={1}>
                <Text fontSize="xl" fontWeight="700" textAlign="center">
                  FiredApp
                </Text>
                <Text fontSize="sm" color="fg.muted" textAlign="center">
                  {isLogin
                    ? 'Ingrese sus credenciales para acceder al panel de control'
                    : 'Cree una cuenta para acceder al panel de control'}
                </Text>
              </VStack>

              <VStack gap={4} w="full">
                {error && (
                  <Text fontSize="sm" color="red.500" textAlign="center">
                    {error}
                  </Text>
                )}

                {!isLogin && (
                  <Stack gap={2} w="full">
                    <Text fontSize="sm" fontWeight="600">Nombre</Text>
                    <Input
                      type="text"
                      placeholder="Juan Pérez"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      onBlur={() => validateName(name)}
                      onKeyDown={handleKeyPress}
                      bg="bg.input"
                      borderWidth={nameError ? '2px' : '0'}
                      borderColor={nameError ? 'red.500' : 'transparent'}
                      _hover={{ bg: 'bg.muted' }}
                      _focus={{
                        bg: 'bg.default',
                        borderColor: nameError ? 'red.500' : 'brand.orange',
                        borderWidth: '2px',
                      }}
                    />
                    {nameError && (
                      <Text fontSize="xs" color="red.500">
                        {nameError}
                      </Text>
                    )}
                  </Stack>
                )}

                <Stack gap={2} w="full">
                  <Text fontSize="sm" fontWeight="600">Correo Electrónico</Text>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    onBlur={() => validateEmail(email)}
                    onKeyDown={handleKeyPress}
                    bg="bg.input"
                    borderWidth={emailError ? '2px' : '0'}
                    borderColor={emailError ? 'red.500' : 'transparent'}
                    _hover={{ bg: 'bg.muted' }}
                    _focus={{
                      bg: 'bg.default',
                      borderColor: emailError ? 'red.500' : 'brand.orange',
                      borderWidth: '2px',
                    }}
                  />
                  {emailError && (
                    <Text fontSize="xs" color="red.500">
                      {emailError}
                    </Text>
                  )}
                </Stack>

                <Stack gap={2} w="full">
                  <Text fontSize="sm" fontWeight="600">Contraseña</Text>
                  <Box position="relative" w="full">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      onBlur={() => validatePassword(password)}
                      onKeyDown={handleKeyPress}
                      bg="bg.input"
                      borderWidth={passwordError ? '2px' : '0'}
                      borderColor={passwordError ? 'red.500' : 'transparent'}
                      _hover={{ bg: 'bg.muted' }}
                      _focus={{
                        bg: 'bg.default',
                        borderColor: passwordError ? 'red.500' : 'brand.orange',
                        borderWidth: '2px',
                      }}
                      pr="40px"
                    />
                    <IconButton
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      position="absolute"
                      right="8px"
                      top="50%"
                      transform="translateY(-50%)"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      _hover={{ bg: 'transparent' }}
                    >
                      {showPassword ? <FaEyeSlash color="#6B6B6B" /> : <FaEye color="#6B6B6B" />}
                    </IconButton>
                  </Box>
                  {passwordError && (
                    <Text fontSize="xs" color="red.500">
                      {passwordError}
                    </Text>
                  )}
                </Stack>

                <MotionBox
                  w="full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    w="full"
                    bg="fg.default"
                    color="bg.default"
                    size="lg"
                    onClick={handleSubmit}
                    loading={isLoading}
                    _hover={{
                      bg: 'gray.700',
                    }}
                  >
                    {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                  </Button>
                </MotionBox>

                <Stack gap={2} align="center" mt={2} w="full">
                  <Link
                    fontSize="sm"
                    color="brand.orange"
                    fontWeight="600"
                    onClick={onNavigate}
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {isLogin
                      ? '¿No tienes cuenta? Regístrate'
                      : '¿Ya tienes cuenta? Inicia sesión'}
                  </Link>
                </Stack>
              </VStack>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AuthForm;

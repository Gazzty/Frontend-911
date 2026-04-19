import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFire, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Box, Container, VStack, Text, Input, Button, Link, Stack, IconButton } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { authService } from '../services/authService';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

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

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.login(email, password);
      authService.saveUser(user);
      
      toaster.create({
        title: 'Bienvenido',
        description: 'Inicio de sesión exitoso',
        type: 'success',
        duration: 2000,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Credenciales inválidas',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      minH="100vh"
      bg="brand.beige"
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
            bg="white"
            p={10}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="gray.200"
          >
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
                  Sistema de detección de Incendios
                </Text>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  Ingrese sus credenciales para acceder al panel de control
                </Text>
              </VStack>

              <VStack gap={4} w="full">
                <Stack gap={2} w="full">
                  <Text fontSize="sm" fontWeight="600">Correo Electrónico</Text>
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    onBlur={() => validateEmail(email)}
                    onKeyDown={handleKeyPress}
                    bg="gray.100"
                    borderWidth={emailError ? '2px' : '0'}
                    borderColor={emailError ? 'red.500' : 'transparent'}
                    _hover={{ bg: 'gray.200' }}
                    _focus={{
                      bg: 'white',
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
                        if (passwordError) validatePassword(e.target.value);
                      }}
                      onBlur={() => validatePassword(password)}
                      onKeyDown={handleKeyPress}
                      bg="gray.100"
                      borderWidth={passwordError ? '2px' : '0'}
                      borderColor={passwordError ? 'red.500' : 'transparent'}
                      _hover={{ bg: 'gray.200' }}
                      _focus={{
                        bg: 'white',
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
                    bg="brand.black"
                    color="white"
                    size="lg"
                    onClick={handleLogin}
                    loading={isLoading}
                    _hover={{
                      bg: 'gray.700',
                    }}
                  >
                    Iniciar Sesión
                  </Button>
                </MotionBox>

                <Link
                  fontSize="sm"
                  color="gray.500"
                  _hover={{ color: 'brand.orange' }}
                >
                  ¿Olvidó su contraseña?
                </Link>
              </VStack>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default LoginPage;
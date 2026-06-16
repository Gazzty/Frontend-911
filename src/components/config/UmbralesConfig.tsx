import { Box, Text, VStack, Input, Button, Stack } from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const MotionBox = motion.create(Box);

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

interface UmbralesConfigProps {
  temperatura: number;
  intervaloMedicion: number;
  onSave: (temperatura: number, intervalo: number) => void;
}

const UmbralesConfig = ({
  temperatura: initialTemp,
  intervaloMedicion: initialIntervalo,
  onSave,
}: UmbralesConfigProps) => {
  const [tempValue, setTempValue] = useState(initialTemp.toString());
  const [intervaloValue, setIntervaloValue] = useState(initialIntervalo.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [tempError, setTempError] = useState('');
  const [intervaloError, setIntervaloError] = useState('');

  useEffect(() => {
    setTempValue(initialTemp.toString());
  }, [initialTemp]);

  useEffect(() => {
    setIntervaloValue(initialIntervalo.toString());
  }, [initialIntervalo]);

  const validateTemperatura = (value: string): boolean => {
    if (value === '') {
      setTempError('Ingresa un valor');
      return false;
    }
    
    const numVal = Number(value);
    
    if (isNaN(numVal)) {
      setTempError('Debe ser un número');
      return false;
    }
    if (numVal <= 0) {
      setTempError('Debe ser mayor a 0°C');
      return false;
    }
    if (numVal > 100) {
      setTempError('Máximo 100°C');
      return false;
    }
    setTempError('');
    return true;
  };

  const validateIntervalo = (value: string): boolean => {
    if (value === '') {
      setIntervaloError('Ingresa un valor');
      return false;
    }
    
    const numVal = Number(value);
    
    if (isNaN(numVal)) {
      setIntervaloError('Debe ser un número');
      return false;
    }
    if (numVal < 10) {
      setIntervaloError('Mínimo 10 segundos');
      return false;
    }
    if (numVal > 3600) {
      setIntervaloError('Máximo 3600 segundos');
      return false;
    }
    setIntervaloError('');
    return true;
  };

  const handleTemperaturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setTempValue(val);
      if (tempError) {
        setTempError('');
      }
    }
  };

  const handleIntervaloChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (val === '' || /^\d+$/.test(val)) {
      setIntervaloValue(val);
      if (intervaloError) {
        setIntervaloError('');
      }
    }
  };

  const handleSave = async () => {
    const isTempValid = validateTemperatura(tempValue);
    const isIntervaloValid = validateIntervalo(intervaloValue);

    if (!isTempValid || !isIntervaloValid) {
      toaster.create({
        title: 'Error de validación',
        description: 'Corrige los errores antes de guardar',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(Number(tempValue), Number(intervaloValue));
      
      toaster.create({
        title: 'Guardado',
        description: 'Configuración actualizada correctamente',
        type: 'success',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = 
    Number(tempValue) !== initialTemp || 
    Number(intervaloValue) !== initialIntervalo;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
          Configuración de Umbrales
        </Text>

        <VStack gap={4} align="stretch">
          <Stack gap={2}>
            <Text fontSize="sm" fontWeight="600">
              Temperatura Máxima (°C)
            </Text>
            <Input
              type="text"
              value={tempValue}
              onChange={handleTemperaturaChange}
              onBlur={() => tempValue !== '' && validateTemperatura(tempValue)}
              bg="bg.input"
              borderWidth={tempError ? '2px' : '0'}
              borderColor={tempError ? 'red.500' : 'transparent'}
              _hover={{ bg: 'bg.muted' }}
              _focus={{
                bg: 'bg.default',
                borderColor: tempError ? 'red.500' : 'brand.orange', 
                borderWidth: '2px' 
              }}
              placeholder="Ej: 50"
            />
            {tempError && (
              <Text fontSize="xs" color="red.500">
                {tempError}
              </Text>
            )}
            <Text fontSize="xs" color="fg.muted">
              Temperatura por encima de la cual se considera alerta
            </Text>
          </Stack>

          <Stack gap={2}>
            <Text fontSize="sm" fontWeight="600">
              Intervalo de Medición (Segundos)
            </Text>
            <Input
              type="text"
              value={intervaloValue}
              onChange={handleIntervaloChange}
              onBlur={() => intervaloValue !== '' && validateIntervalo(intervaloValue)}
              bg="bg.input"
              borderWidth={intervaloError ? '2px' : '0'}
              borderColor={intervaloError ? 'red.500' : 'transparent'}
              _hover={{ bg: 'bg.muted' }}
              _focus={{
                bg: 'bg.default',
                borderColor: intervaloError ? 'red.500' : 'brand.orange', 
                borderWidth: '2px' 
              }}
              placeholder="Ej: 600"
            />
            {intervaloError && (
              <Text fontSize="xs" color="red.500">
                {intervaloError}
              </Text>
            )}
            <Text fontSize="xs" color="fg.muted">
              Frecuencia con la que los sensores toman mediciones
            </Text>
          </Stack>

          <MotionBox whileHover={{ scale: hasChanges && !tempError && !intervaloError ? 1.02 : 1 }} whileTap={{ scale: hasChanges && !tempError && !intervaloError ? 0.98 : 1 }}>
            <Button
              w="full"
              bg={hasChanges && !tempError && !intervaloError ? 'brand.black' : 'gray.400'}
              color="white"
              onClick={handleSave}
              loading={isLoading}
              disabled={!hasChanges || tempError !== '' || intervaloError !== '' || isLoading}
              _hover={{
                bg: hasChanges && !tempError && !intervaloError ? 'gray.700' : 'gray.400',
                cursor: hasChanges && !tempError && !intervaloError ? 'pointer' : 'not-allowed',
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

export default UmbralesConfig;
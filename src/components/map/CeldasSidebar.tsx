import { Box, Text, VStack, HStack } from '@chakra-ui/react';
import { useState } from 'react';
import type { Celda } from '../../types';
import CeldaCard from '../dashboard/CeldaCard';

type Filtro = 'todas' | 'alerta' | 'activas' | 'inactivas';

interface CeldasSidebarProps {
  celdas: Celda[];
  onCeldaClick?: (celda: Celda) => void;
}

interface FiltroConfig {
  key: Filtro;
  label: string;
  count: number;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  dotColor: string;
}

const CeldasSidebar = ({ celdas, onCeldaClick }: CeldasSidebarProps) => {
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const alertCount = celdas.filter((c) => c.sensores.some((s) => s.enFuego)).length;
  const activasCount = celdas.filter((c) => c.activa && !c.sensores.some((s) => s.enFuego)).length;
  const inactivasCount = celdas.filter((c) => !c.activa).length;

  const celdasFiltradas = celdas.filter((c) => {
    if (filtro === 'alerta') return c.sensores.some((s) => s.enFuego);
    if (filtro === 'activas') return c.activa && !c.sensores.some((s) => s.enFuego);
    if (filtro === 'inactivas') return !c.activa;
    return true;
  });

  const filtros: FiltroConfig[] = [
    { key: 'todas', label: 'Todas', count: celdas.length, activeColor: '#2D3748', activeBg: '#EDF2F7', activeBorder: '#CBD5E0', dotColor: '#718096' },
    { key: 'alerta', label: 'Alerta', count: alertCount, activeColor: '#C53030', activeBg: '#FFF5F5', activeBorder: '#FC8181', dotColor: '#FF4500' },
    { key: 'activas', label: 'Activas', count: activasCount, activeColor: '#22543D', activeBg: '#F0FFF4', activeBorder: '#9AE6B4', dotColor: '#51CF66' },
    { key: 'inactivas', label: 'Inactivas', count: inactivasCount, activeColor: '#4A5568', activeBg: '#F7FAFC', activeBorder: '#CBD5E0', dotColor: '#A0AEC0' },
  ];

  return (
    <Box
      bg="white"
      borderRadius="xl"
      boxShadow="0 4px 24px rgba(0,0,0,0.08)"
      borderWidth="1px"
      borderColor="gray.200"
      h={{ base: 'auto', lg: '600px' }}
      maxH={{ base: '300px', lg: '600px' }}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box px={5} pt={5} pb={4} borderBottomWidth="1px" borderColor="gray.100">
        <HStack justify="space-between" mb={4}>
          <Text fontSize="md" fontWeight="700" color="gray.800">
            Celdas
          </Text>
          <Box bg="gray.100" px={2} py={0.5} borderRadius="full">
            <Text fontSize="xs" fontWeight="600" color="gray.500">{celdas.length} total</Text>
          </Box>
        </HStack>

        {/* Stats */}
        <HStack gap={0} bg="gray.50" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="gray.100">
          {[
            { value: alertCount, label: 'Alerta', color: '#E53E3E' },
            { value: activasCount, label: 'Activas', color: '#38A169' },
            { value: inactivasCount, label: 'Inactivas', color: '#A0AEC0' },
          ].map(({ value, label, color }, i) => (
            <Box key={label} flex={1} py={2} textAlign="center" borderLeftWidth={i > 0 ? '1px' : '0'} borderColor="gray.200">
              <Text fontSize="lg" fontWeight="800" color={color} lineHeight="1">{value}</Text>
              <Text fontSize="10px" color="gray.400" mt={0.5} fontWeight="500">{label}</Text>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Filtros */}
      <HStack gap={1} px={4} py={3} borderBottomWidth="1px" borderColor="gray.100" flexShrink={0}>
        {filtros.map(({ key, label, count, activeColor, activeBg, activeBorder, dotColor }) => {
          const isActive = filtro === key;
          return (
            <Box
              key={key}
              as="button"
              flex={1}
              py={1.5}
              px={1}
              borderRadius="lg"
              bg={isActive ? activeBg : 'transparent'}
              borderWidth="1px"
              borderColor={isActive ? activeBorder : 'transparent'}
              cursor="pointer"
              onClick={() => setFiltro(key)}
              transition="all 0.15s ease"
              _hover={{ bg: isActive ? activeBg : 'gray.50' }}
            >
              <VStack gap={0.5}>
                <HStack gap={1} justify="center">
                  <Box w="6px" h="6px" borderRadius="full" bg={dotColor} flexShrink={0} />
                  <Text fontSize="10px" fontWeight={isActive ? '700' : '500'} color={isActive ? activeColor : 'gray.400'}>
                    {label}
                  </Text>
                </HStack>
                <Text fontSize="13px" fontWeight="700" color={isActive ? activeColor : 'gray.600'} lineHeight="1">
                  {count}
                </Text>
              </VStack>
            </Box>
          );
        })}
      </HStack>

      {/* Lista */}
      <Box overflowY="auto" flex={1} px={3} py={2}>
        <VStack gap={0} align="stretch">
          {celdasFiltradas.map((celda, index) => (
            <CeldaCard
              key={celda.id}
              celda={celda}
              index={index}
              onClick={onCeldaClick}
            />
          ))}
          {celdasFiltradas.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text fontSize="2xl" mb={2}>🔍</Text>
              <Text fontSize="sm" color="gray.400" fontWeight="500">
                No hay celdas con este filtro
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default CeldasSidebar;

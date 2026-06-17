import { Box, Text, VStack, HStack, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaFire, FaThermometerHalf } from 'react-icons/fa';
import type { EventLogItem } from '../../api/eventsLogApi';

const MotionBox = motion.create(Box);

interface AlertaCardProps {
  alerta: EventLogItem;
  index: number;
}

const isFire = (item: EventLogItem) => item.alertLogTypeId === 2;

const AlertaCard = ({ alerta, index }: AlertaCardProps) => {
  const fire = isFire(alerta);
  const colorScheme = fire
    ? {
        bg: 'red.50', border: 'red.200', hoverBg: 'red.100', hoverBorder: 'red.300',
        iconBg: 'red.500', textTitle: 'red.900', textSub: 'red.700',
        darkBg: 'rgba(220, 38, 38, 0.12)', darkBorder: 'red.800',
        darkHoverBg: 'rgba(220, 38, 38, 0.2)', darkHoverBorder: 'red.700',
        darkIconBg: 'red.600', darkTextTitle: 'red.300', darkTextSub: 'red.400',
      }
    : {
        bg: 'orange.50', border: 'orange.200', hoverBg: 'orange.100', hoverBorder: 'orange.300',
        iconBg: 'orange.500', textTitle: 'orange.900', textSub: 'orange.700',
        darkBg: 'rgba(234, 88, 12, 0.12)', darkBorder: 'orange.800',
        darkHoverBg: 'rgba(234, 88, 12, 0.2)', darkHoverBorder: 'orange.700',
        darkIconBg: 'orange.600', darkTextTitle: 'orange.300', darkTextSub: 'orange.400',
      };

  const formatFecha = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
      whileHover={{ x: 4 }}
    >
      <Box
        bg={colorScheme.bg}
        p={4}
        borderRadius="md"
        borderWidth="1px"
        borderColor={colorScheme.border}
        transition="all 0.3s ease"
        _hover={{ bg: colorScheme.hoverBg, borderColor: colorScheme.hoverBorder }}
        _dark={{
          bg: colorScheme.darkBg,
          borderColor: colorScheme.darkBorder,
          _hover: { bg: colorScheme.darkHoverBg, borderColor: colorScheme.darkHoverBorder },
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
              bg={colorScheme.iconBg}
              borderRadius="full"
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              _dark={{ bg: colorScheme.darkIconBg }}
            >
              {fire ? <FaFire color="white" size={16} /> : <FaThermometerHalf color="white" size={16} />}
            </Box>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="600" color={colorScheme.textTitle} _dark={{ color: colorScheme.darkTextTitle }}>
                {alerta.summary}
              </Text>
              <Text fontSize="xs" color={colorScheme.textSub} noOfLines={2} _dark={{ color: colorScheme.darkTextSub }}>
                {alerta.detail}
              </Text>
              <Text fontSize="xs" color={colorScheme.textSub} opacity={0.8} _dark={{ color: colorScheme.darkTextSub }}>
                {formatFecha(alerta.date)}
              </Text>
            </VStack>
          </HStack>
        </Flex>
      </Box>
    </MotionBox>
  );
};

export default AlertaCard;

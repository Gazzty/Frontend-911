import { Box, Text } from '@chakra-ui/react';
import type { ElementType } from 'react';

interface ConfigTabButtonProps {
  icon: ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ConfigTabButton = ({ icon: Icon, label, isActive, onClick }: ConfigTabButtonProps) => {
  return (
    <Box
      px={4}
      py={2}
      bg={isActive ? 'gray.100' : 'transparent'}
      fontWeight={isActive ? '600' : '400'}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.3s ease"
      display="flex"
      alignItems="center"
      gap={2}
    >
      <Icon />
      <Text fontSize="sm">{label}</Text>
    </Box>
  );
};

export default ConfigTabButton;

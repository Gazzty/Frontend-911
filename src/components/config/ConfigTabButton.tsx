import { Box } from '@chakra-ui/react';
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
      as="button"
      title={label}
      aria-label={label}
      px={3}
      py={2}
      bg={isActive ? 'gray.100' : 'transparent'}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s ease"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={isActive ? 'brand.black' : 'gray.400'}
      _hover={{ bg: 'gray.100', color: 'brand.black' }}
    >
      <Icon size={18} />
    </Box>
  );
};

export default ConfigTabButton;

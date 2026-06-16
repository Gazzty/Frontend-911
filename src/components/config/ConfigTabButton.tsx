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
      bg={isActive ? 'bg.muted' : 'transparent'}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s ease"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={isActive ? 'fg.default' : 'fg.muted'}
      _hover={{ bg: 'bg.muted', color: 'fg.default' }}
    >
      <Icon size={18} />
    </Box>
  );
};

export default ConfigTabButton;

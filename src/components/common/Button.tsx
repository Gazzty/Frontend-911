import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create('div');

export interface ButtonProps extends ChakraButtonProps {
  children: React.ReactNode;
  animate?: boolean;
}

const Button = ({ children, animate = true, ...props }: ButtonProps) => {
  const ButtonContent = (
    <ChakraButton
      {...props}
      _hover={{
        transform: animate ? 'translateY(-2px)' : 'none',
        boxShadow: animate ? 'md' : 'none',
        ...props._hover,
      }}
      transition="all 0.2s"
    >
      {children}
    </ChakraButton>
  );

  if (!animate) return ButtonContent;

  return (
    <MotionBox whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
      {ButtonContent}
    </MotionBox>
  );
};

export default Button;

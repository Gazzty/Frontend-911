import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  delay?: number;
}

const StatCard = ({ title, value, subtitle, delay = 0 }: StatCardProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, boxShadow: 'lg' }}
    >
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        transition="all 0.3s ease"
      >
        <VStack align="start" gap={2}>
          <Text fontSize="sm" color="gray.500" fontWeight="600">
            {title}
          </Text>
          <Text fontSize="3xl" fontWeight="700" color="brand.black">
            {value}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {subtitle}
          </Text>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default StatCard;
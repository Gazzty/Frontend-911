import { Box, Flex, Text, Button, HStack } from '@chakra-ui/react';
import { FaFire, FaThLarge, FaMap, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';

const MotionBox = motion.create(Box);

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon: Icon, label, isActive }: NavItemProps) => {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <MotionBox
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Flex
          align="center"
          gap={2}
          px={4}
          py={2}
          h="60px"
          borderBottom={isActive ? '3px solid' : '3px solid transparent'}
          borderColor={isActive ? 'brand.orange' : 'transparent'}
          color={isActive ? 'brand.black' : 'gray.500'}
          fontWeight={isActive ? '600' : '400'}
          cursor="pointer"
          _hover={{
            color: 'brand.black',
          }}
          transition="all 0.3s ease"
        >
          <Icon size={16} />
          <Text fontSize="sm">{label}</Text>
        </Flex>
      </MotionBox>
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <Box
      bg="white"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottom="1px solid"
      borderColor="gray.200"
      w="100%"
    >
      <Box maxW="1400px" mx="auto" px={6}>
        <Flex h="60px" justify="space-between" align="center">
          {/* Logo */}
          <Flex align="center" gap={2} minW="250px">
            <Box
              bg="brand.orange"
              borderRadius="full"
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaFire color="white" size={20} />
            </Box>
            <Text fontSize="md" fontWeight="600" whiteSpace="nowrap">
              Sistema de incendios
            </Text>
          </Flex>

          {/* Nav Items */}
          <HStack gap={0} flex={1} justify="center">
            <NavItem
              to="/dashboard"
              icon={FaThLarge}
              label="Dashboard"
              isActive={location.pathname === '/dashboard'}
            />
            <NavItem
              to="/mapa"
              icon={FaMap}
              label="Mapa"
              isActive={location.pathname === '/mapa'}
            />
            <NavItem
              to="/configuracion"
              icon={FaCog}
              label="Configuración"
              isActive={location.pathname === '/configuracion'}
            />
          </HStack>

          {/* User Info */}
          <Flex align="center" gap={3} minW="250px" justify="flex-end">
            <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
              {user?.email}
            </Text>
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                bg="brand.orange"
                color="white"
                onClick={handleLogout}
                _hover={{
                  bg: '#E63E00',
                }}
                whiteSpace="nowrap"
                padding={2}
              >
                <FaSignOutAlt />
                <Text ml={2}>Salir</Text>
              </Button>
            </MotionBox>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export default Navbar;
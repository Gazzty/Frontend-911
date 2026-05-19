import { Box, Flex, Text, Button, HStack, IconButton } from '@chakra-ui/react';
import { FaFire, FaThLarge, FaMap, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import { useState } from 'react';

const MotionBox = motion.create(Box);

interface NavItemProps {
  to: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon: Icon, label, isActive }: NavItemProps) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <MotionBox whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
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
        _hover={{ color: 'brand.black' }}
        transition="all 0.3s ease"
      >
        <Icon size={16} />
        <Text fontSize="sm">{label}</Text>
      </Flex>
    </MotionBox>
  </Link>
);

const MobileNavItem = ({ to, icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <Link to={to} style={{ textDecoration: 'none', width: '100%' }} onClick={onClick}>
    <Flex
      align="center"
      gap={3}
      px={4}
      py={3}
      bg={isActive ? 'orange.50' : 'transparent'}
      borderLeft={isActive ? '3px solid' : '3px solid transparent'}
      borderColor={isActive ? 'brand.orange' : 'transparent'}
      color={isActive ? 'brand.black' : 'gray.600'}
      fontWeight={isActive ? '600' : '400'}
      _hover={{ bg: 'gray.50', color: 'brand.black' }}
      transition="all 0.2s ease"
    >
      <Icon size={18} />
      <Text fontSize="sm">{label}</Text>
    </Flex>
  </Link>
);

const navItems = [
  { to: '/dashboard', icon: FaThLarge, label: 'Dashboard' },
  { to: '/mapa', icon: FaMap, label: 'Mapa' },
  { to: '/configuracion', icon: FaCog, label: 'Configuración' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex h="60px" justify="space-between" align="center">
          {/* Logo */}
          <Flex align="center" gap={2} flexShrink={0}>
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
            <Text
              fontSize="md"
              fontWeight="600"
              whiteSpace="nowrap"
              display={{ base: 'none', sm: 'block' }}
            >
              Sistema de incendios
            </Text>
          </Flex>

          {/* Mobile: current page label (only when menu is closed) */}
          {!isMobileMenuOpen && (
            <Text
              display={{ base: 'block', md: 'none' }}
              fontSize="sm"
              fontWeight="600"
              color="brand.black"
            >
              {navItems.find((item) => item.to === location.pathname)?.label ?? ''}
            </Text>
          )}

          {/* Desktop nav */}
          <HStack gap={0} flex={1} justify="center" display={{ base: 'none', md: 'flex' }}>
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={location.pathname === item.to}
              />
            ))}
          </HStack>

          {/* Desktop user */}
          <Flex
            align="center"
            gap={3}
            justify="flex-end"
            flexShrink={0}
            display={{ base: 'none', md: 'flex' }}
          >
            <Text
              fontSize="sm"
              color="gray.500"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              maxW="180px"
            >
              {user?.email}
            </Text>
            <MotionBox whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                bg="brand.orange"
                color="white"
                onClick={handleLogout}
                _hover={{ bg: '#E63E00' }}
                whiteSpace="nowrap"
                padding={2}
              >
                <FaSignOutAlt />
                <Text ml={2}>Salir</Text>
              </Button>
            </MotionBox>
          </Flex>

          {/* Mobile hamburger */}
          <IconButton
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </IconButton>
        </Flex>
      </Box>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <Box
          display={{ base: 'block', md: 'none' }}
          bg="white"
          borderTop="1px solid"
          borderColor="gray.100"
          boxShadow="md"
        >
          {navItems.map((item) => (
            <MobileNavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname === item.to}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
          <Flex
            align="center"
            justify="space-between"
            gap={3}
            px={4}
            py={3}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Text
              fontSize="xs"
              color="gray.500"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              flex={1}
            >
              {user?.email}
            </Text>
            <Button
              size="sm"
              bg="brand.orange"
              color="white"
              onClick={handleLogout}
              _hover={{ bg: '#E63E00' }}
              flexShrink={0}
            >
              <FaSignOutAlt />
              <Text ml={2}>Salir</Text>
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;

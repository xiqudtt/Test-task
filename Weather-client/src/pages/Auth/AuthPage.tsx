import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  useBreakpointValue,
  Divider,
  Icon,
  SlideFade,
  Circle,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiSun, FiCloud } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Адаптивные значения
  const containerWidth = useBreakpointValue({ base: '100%', md: '450px' });
  const headerSize = useBreakpointValue({ base: 'xl', md: '2xl' });

  // Цвета и стили
  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const highlightColor = useColorModeValue('purple.500', 'purple.300');

  // Анимации
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const decorationAnimation = {
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  const buttonAnimation = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.95 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      toast({
        title: isLogin ? 'Вход выполнен' : 'Регистрация успешна',
        status: 'success',
        duration: 3000,
      });
      navigate('/weather');
    } catch (err: any) {
      toast({
        title: 'Ошибка',
        description: err.message || 'Произошла ошибка',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      py={{ base: 10, md: 20 }}
      px={4}
      position="relative"
      overflow="hidden"
    >
      {/* Декоративные элементы на фоне */}
      <MotionBox
        initial="initial"
        animate="animate"
        variants={decorationAnimation}
        position="absolute"
        top="5%"
        right="10%"
        opacity={0.1}
      >
        <Icon as={FiSun} w={20} h={20} color="white" />
      </MotionBox>
      <MotionBox
        initial="initial"
        animate="animate"
        variants={decorationAnimation}
        position="absolute"
        bottom="15%"
        left="5%"
        opacity={0.1}
      >
        <Icon as={FiCloud} w={16} h={16} color="white" />
      </MotionBox>

      <Container maxW={containerWidth}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={isLogin ? 'login' : 'register'}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={formAnimation}
          >
            <Box
              bg={cardBg}
              p={{ base: 6, md: 8 }}
              borderRadius="2xl"
              boxShadow="2xl"
              position="relative"
              overflow="hidden"
            >
              <VStack spacing={8} position="relative" zIndex={1}>
                <VStack spacing={3}>
                  <Circle
                    size="60px"
                    bg={highlightColor}
                    color="white"
                    mb={2}
                  >
                    <Icon as={isLogin ? FiLock : FiUser} w={6} h={6} />
                  </Circle>
                  <Heading
                    size={headerSize}
                    color={textColor}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {isLogin ? 'С возвращением!' : 'Создать аккаунт'}
                  </Heading>
                  <Text color={mutedColor} textAlign="center" fontSize="lg">
                    {isLogin
                      ? 'Рады видеть вас снова! Войдите для просмотра погоды'
                      : 'Присоединяйтесь к нам для доступа к прогнозу погоды'}
                  </Text>
                  
                  {/* Добавляем информацию о тестовых данных */}
                  <Box 
                    p={4} 
                    bg={useColorModeValue('blue.50', 'blue.900')} 
                    borderRadius="lg"
                    width="100%"
                  >
                    <Text color={mutedColor} fontSize="sm" textAlign="center">
                      Для тестового входа используйте:
                      <br />
                      Email: <Text as="span" color={highlightColor} fontWeight="bold">eve.holt@reqres.in</Text>
                      <br />
                      Password: <Text as="span" color={highlightColor} fontWeight="bold">cityslicka</Text>
                    </Text>
                  </Box>
                </VStack>

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  <VStack spacing={4} align="stretch">
                    <SlideFade in={!isLogin} unmountOnExit>
                      {!isLogin && (
                        <FormControl isRequired>
                          <FormLabel color={mutedColor}>Имя</FormLabel>
                          <InputGroup>
                            <Input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Введите ваше имя"
                              bg={inputBg}
                              borderRadius="xl"
                              size="lg"
                              pl="40px"
                              _focus={{
                                borderColor: highlightColor,
                                boxShadow: `0 0 0 1px ${highlightColor}`,
                              }}
                              _hover={{
                                borderColor: highlightColor,
                              }}
                            />
                            <InputRightElement left="0" height="100%" pointerEvents="none">
                              <Icon as={FiUser} color={highlightColor} w={5} h={5} ml={3} />
                            </InputRightElement>
                          </InputGroup>
                        </FormControl>
                      )}
                    </SlideFade>

                    <FormControl isRequired>
                      <FormLabel color={mutedColor}>Email</FormLabel>
                      <InputGroup>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Введите ваш email"
                          bg={inputBg}
                          borderRadius="xl"
                          size="lg"
                          pl="40px"
                          _focus={{
                            borderColor: highlightColor,
                            boxShadow: `0 0 0 1px ${highlightColor}`,
                          }}
                          _hover={{
                            borderColor: highlightColor,
                          }}
                        />
                        <InputRightElement left="0" height="100%" pointerEvents="none">
                          <Icon as={FiMail} color={highlightColor} w={5} h={5} ml={3} />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={mutedColor}>Пароль</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Введите пароль"
                          bg={inputBg}
                          borderRadius="xl"
                          size="lg"
                          pl="40px"
                          _focus={{
                            borderColor: highlightColor,
                            boxShadow: `0 0 0 1px ${highlightColor}`,
                          }}
                          _hover={{
                            borderColor: highlightColor,
                          }}
                        />
                        <InputRightElement left="0" height="100%" pointerEvents="none">
                          <Icon as={FiLock} color={highlightColor} w={5} h={5} ml={3} />
                        </InputRightElement>
                        <InputRightElement height="100%">
                          <IconButton
                            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                            icon={showPassword ? <FiEyeOff /> : <FiEye />}
                            variant="ghost"
                            color={highlightColor}
                            onClick={() => setShowPassword(!showPassword)}
                            _hover={{ bg: 'transparent' }}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <MotionBox
                      as={Button}
                      type="submit"
                      colorScheme="purple"
                      size="lg"
                      width="100%"
                      isLoading={loading}
                      borderRadius="xl"
                      mt={2}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonAnimation}
                    >
                      {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </MotionBox>
                  </VStack>
                </form>

                <Divider />

                <Flex direction="column" align="center" w="100%">
                  <Text color={mutedColor} mb={2}>
                    {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
                  </Text>
                  <MotionBox
                    as={Button}
                    variant="ghost"
                    color={highlightColor}
                    onClick={() => setIsLogin(!isLogin)}
                    _hover={{ bg: `${highlightColor}10` }}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonAnimation}
                  >
                    {isLogin ? 'Создать аккаунт' : 'Войти'}
                  </MotionBox>
                </Flex>
              </VStack>
            </Box>
          </MotionBox>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default AuthPage; 
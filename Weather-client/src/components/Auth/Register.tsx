import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  useToast,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('eve.holt@reqres.in'); // Предзаполняем тестовым email
  const [password, setPassword] = useState('pistol'); // Предзаполняем тестовым паролем
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    if (!email) {
      setError('Email обязателен');
      return false;
    }
    if (!password) {
      setError('Пароль обязателен');
      return false;
    }
    if (!email.includes('@')) {
      setError('Введите корректный email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      toast({
        title: 'Ошибка валидации',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      toast({
        title: 'Успешная регистрация',
        description: 'Вы успешно зарегистрировались',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/weather');
    } catch (error: any) {
      const errorMessage = error.message || 'Произошла ошибка при регистрации';
      setError(errorMessage);
      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <Heading size="lg" mb={2}>
          Регистрация
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Для тестовой регистрации используйте:<br />
          Email: eve.holt@reqres.in<br />
          Password: pistol
        </Text>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Введите ваш email"
            isDisabled={isLoading}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <FormControl isRequired isInvalid={!!error}>
          <FormLabel>Пароль</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Введите пароль"
            isDisabled={isLoading}
          />
          {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          mt={4}
          isLoading={isLoading}
          loadingText="Регистрация..."
        >
          Зарегистрироваться
        </Button>
      </VStack>
    </Box>
  );
};

export default Register; 
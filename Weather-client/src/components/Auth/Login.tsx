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
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/weather');
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Проверьте правильность введенных данных',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <Heading size="lg" mb={2}>
          Вход в систему
        </Heading>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Для тестового входа используйте:<br />
          Email: eve.holt@reqres.in<br />
          Password: cityslicka
        </Text>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Введите ваш email"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Пароль</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Введите пароль"
          />
        </FormControl>
        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          mt={4}
          isLoading={isLoading}
        >
          Войти
        </Button>
      </VStack>
    </Box>
  );
};

export default Login; 
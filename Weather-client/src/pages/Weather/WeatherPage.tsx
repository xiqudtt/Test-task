import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Spinner,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  useColorModeValue,
  Icon,
  Flex,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FiWind, FiDroplet, FiSun, FiSunset, FiEye, FiCloud, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Отключаем Service Worker в режиме разработки
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service Worker отключен');
    });
  });
}

const MOSCOW_COORDINATES = {
  lat: 55.7558,
  lon: 37.6173
};

const WEATHER_API_CONFIG = {
  baseURL: '/api/weather',
  apiKey: 'f4ba6a6428a7ff65cb2b95f0d28ac29d'
};

// Создаем экземпляр axios с базовой конфигурацией
const weatherApi = axios.create({
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик запросов для логирования
weatherApi.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('Отправка запроса:', {
      fullUrl,
      method: config.method,
      params: config.params,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для логирования
weatherApi.interceptors.response.use(
  (response) => {
    console.log('Получен успешный ответ:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', {
      message: error.message,
      code: error.code,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      },
      request: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    return Promise.reject(error);
  }
);

interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

interface WeatherErrorResponse {
  cod: number;
  message: string;
}

interface WeatherSuccessResponse extends WeatherData {
  cod: 200;
}

const isErrorResponse = (data: WeatherApiResponse): data is WeatherErrorResponse => {
  return data.cod !== 200;
};

type WeatherApiResponse = WeatherSuccessResponse | WeatherErrorResponse;

const WeatherPage: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const formatTime = (timestamp: number, timezone: number) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getWindDirection = (deg: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Формируем параметры запроса
        const params = {
          lat: MOSCOW_COORDINATES.lat,
          lon: MOSCOW_COORDINATES.lon,
          appid: WEATHER_API_CONFIG.apiKey,
          units: 'metric',
          lang: 'ru'
        };

        if (!WEATHER_API_CONFIG.apiKey) {
          throw new Error('API ключ не настроен');
        }

        // Выполняем запрос
        const response = await weatherApi.get(WEATHER_API_CONFIG.baseURL, {
          params,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        const data = response.data;
        
        // Проверяем ответ
        if (!data || typeof data !== 'object') {
          console.error('Некорректный формат данных:', data);
          throw new Error('Получен некорректный ответ от сервера');
        }

        if (isErrorResponse(data)) {
          console.error('Ошибка в ответе API:', data);
          throw new Error(data.message || 'Ошибка при получении данных о погоде');
        }

        console.log('Данные успешно получены:', data);
        setWeather(data);
      } catch (err: any) {
        console.error('Полная информация об ошибке:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          code: err.code,
          isAxiosError: axios.isAxiosError(err),
          response: err.response,
          request: err.request
        });

        let errorMessage = 'Не удалось загрузить данные о погоде';

        if (axios.isAxiosError(err)) {
          if (err.code === 'ECONNABORTED') {
            errorMessage = 'Превышено время ожидания запроса';
          } else if (!err.response) {
            errorMessage = 'Нет соединения с сервером. Проверьте подключение к интернету';
          } else if (err.response.status === 401) {
            errorMessage = 'Неверный API ключ';
          } else if (err.response.status === 429) {
            errorMessage = 'Превышен лимит запросов к API';
          } else if (err.response.status === 502) {
            errorMessage = 'Ошибка прокси-сервера. Пожалуйста, попробуйте позже';
          } else {
            errorMessage = err.response.data?.message || err.message || errorMessage;
          }
        } else {
          console.error('Необработанная ошибка:', err);
        }

        setError(errorMessage);
        toast({
          title: 'Ошибка',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const bounce = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  `;

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner 
            size="xl" 
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
          />
          <Text color={textColor}>Загрузка данных о погоде...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minH="100vh" 
      py={{ base: 4, md: 8 }} 
      px={{ base: 2, md: 4 }}
      position="relative"
      zIndex={1}
      bg="transparent"
    >
      <Container 
        maxW="container.lg"
        position="relative"
        zIndex={2}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Flex 
            direction={{ base: 'column', sm: 'row' }}
            justifyContent="space-between" 
            alignItems={{ base: 'flex-start', sm: 'center' }}
            gap={4}
          >
            <Heading 
              size={{ base: "md", md: "lg" }} 
              color={textColor}
              textAlign={{ base: 'center', sm: 'left' }}
              width={{ base: '100%', sm: 'auto' }}
            >
              Погода в {weather?.name || 'Москве'}
            </Heading>
            <Button
              onClick={handleLogout}
              colorScheme="red"
              size={{ base: "md", md: "sm" }}
              width={{ base: '100%', sm: 'auto' }}
              variant="solid"
              _hover={{ 
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
                bg: 'red.500'
              }}
              _active={{
                transform: 'translateY(0)',
                bg: 'red.600'
              }}
              transition="all 0.2s"
              leftIcon={<Icon as={FiLogOut} />}
            >
              Выйти из приложения
            </Button>
          </Flex>

          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {weather && (
            <Grid
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
              gap={{ base: 4, md: 6 }}
            >
             
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Box
                  p={{ base: 4, md: 6 }}
                  borderRadius="2xl"
                  bg={cardBg}
                  boxShadow="lg"
                  position="relative"
                  overflow="hidden"
                >
                  <Flex 
                    direction={{ base: 'column', sm: 'row' }}
                    alignItems={{ base: 'center', sm: 'flex-start' }}
                    justifyContent="space-between"
                    gap={4}
                  >
                    <VStack align={{ base: 'center', sm: 'start' }} spacing={2}>
                      <Text 
                        fontSize={{ base: "4xl", md: "6xl" }} 
                        fontWeight="bold" 
                        color={textColor}
                        textAlign={{ base: 'center', sm: 'left' }}
                      >
                        {Math.round(weather.main.temp)}°C
                      </Text>
                      <Badge 
                        colorScheme="blue" 
                        fontSize={{ base: "sm", md: "md" }}
                        px={3} 
                        py={1} 
                        borderRadius="full"
                      >
                        {weather.weather[0].description}
                      </Badge>
                    </VStack>
                    <Box
                      animation={`${bounce} 2s ease-in-out infinite`}
                      width={{ base: "100px", md: "120px" }}
                      height={{ base: "100px", md: "120px" }}
                    >
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                        alt={weather.weather[0].description}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </Box>
                  </Flex>
                </Box>
              </GridItem>

        
              <GridItem>
                <Box
                  p={6}
                  borderRadius="2xl"
                  bg={cardBg}
                  boxShadow="lg"
                >
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel>Ощущается как</StatLabel>
                      <StatNumber>{Math.round(weather.main.feels_like)}°C</StatNumber>
                    </Stat>
                    <Divider />
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Tooltip label="Минимальная температура">
                        <Stat>
                          <StatLabel>Мин</StatLabel>
                          <StatNumber>{Math.round(weather.main.temp_min)}°C</StatNumber>
                        </Stat>
                      </Tooltip>
                      <Tooltip label="Максимальная температура">
                        <Stat>
                          <StatLabel>Макс</StatLabel>
                          <StatNumber>{Math.round(weather.main.temp_max)}°C</StatNumber>
                        </Stat>
                      </Tooltip>
                    </Grid>
                  </VStack>
                </Box>
              </GridItem>

              <GridItem>
                <Box
                  p={6}
                  borderRadius="2xl"
                  bg={cardBg}
                  boxShadow="lg"
                >
                  <VStack spacing={4} align="stretch">
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        <Icon as={FiDroplet} mr={2} color="blue.400" />
                        <Text>Влажность</Text>
                      </Flex>
                      <CircularProgress 
                        value={weather.main.humidity} 
                        color="blue.400"
                        size="40px"
                      >
                        <CircularProgressLabel>
                          {weather.main.humidity}%
                        </CircularProgressLabel>
                      </CircularProgress>
                    </Flex>
                    <Divider />
                    <Flex align="center" justify="space-between">
                      <Flex align="center">
                        <Icon as={FiWind} mr={2} color="green.400" />
                        <Text>Ветер</Text>
                      </Flex>
                      <Text>{weather.wind.speed} м/с, {getWindDirection(weather.wind.deg)}</Text>
                    </Flex>
                    {weather.wind.gust && (
                      <Text fontSize="sm" color="gray.500" ml={6}>
                        Порывы до {weather.wind.gust} м/с
                      </Text>
                    )}
                  </VStack>
                </Box>
              </GridItem>

              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Box
                  p={{ base: 4, md: 6 }}
                  borderRadius="2xl"
                  bg={cardBg}
                  boxShadow="lg"
                  position="relative"
                  overflow="hidden"
                >
                  <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: 4, md: 6 }}>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiEye} mr={2} color="purple.400" boxSize={{ base: 4, md: 5 }} />
                        <StatLabel fontSize={{ base: "sm", md: "md" }}>Видимость</StatLabel>
                      </Flex>
                      <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{(weather.visibility / 1000).toFixed(1)} км</StatNumber>
                    </Stat>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiCloud} mr={2} color="gray.400" boxSize={{ base: 4, md: 5 }} />
                        <StatLabel fontSize={{ base: "sm", md: "md" }}>Облачность</StatLabel>
                      </Flex>
                      <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{weather.clouds.all}%</StatNumber>
                    </Stat>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiSun} mr={2} color="orange.400" boxSize={{ base: 4, md: 5 }} />
                        <StatLabel fontSize={{ base: "sm", md: "md" }}>Восход</StatLabel>
                      </Flex>
                      <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{formatTime(weather.sys.sunrise, weather.timezone)}</StatNumber>
                    </Stat>
                    <Stat>
                      <Flex align="center">
                        <Icon as={FiSunset} mr={2} color="red.400" boxSize={{ base: 4, md: 5 }} />
                        <StatLabel fontSize={{ base: "sm", md: "md" }}>Закат</StatLabel>
                      </Flex>
                      <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{formatTime(weather.sys.sunset, weather.timezone)}</StatNumber>
                    </Stat>
                  </Grid>
                </Box>
              </GridItem>

              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Box
                  p={{ base: 4, md: 6 }}
                  borderRadius="2xl"
                  bg={cardBg}
                  boxShadow="lg"
                >
                  <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }} gap={{ base: 4, md: 6 }}>
                    <Stat>
                      <StatLabel fontSize={{ base: "sm", md: "md" }}>Давление</StatLabel>
                      <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{Math.round(weather.main.pressure * 0.750062)} мм рт. ст.</StatNumber>
                      <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                        {weather.main.pressure} гПа
                      </StatHelpText>
                    </Stat>
                    {weather.rain?.['1h'] && (
                      <Stat>
                        <StatLabel fontSize={{ base: "sm", md: "md" }}>Осадки</StatLabel>
                        <StatNumber fontSize={{ base: "xl", md: "2xl" }}>{weather.rain['1h']} мм/ч</StatNumber>
                        <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                          За последний час
                        </StatHelpText>
                      </Stat>
                    )}
                  </Grid>
                </Box>
              </GridItem>
            </Grid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default WeatherPage; 
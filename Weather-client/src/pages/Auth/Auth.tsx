import React from 'react';
import { Box, Container, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import Login from '../../components/Auth/Login';
import Register from '../../components/Auth/Register';

const Auth: React.FC = () => {
  return (
    <Container maxW="container.sm" centerContent py={10}>
      <Box w="100%" maxW="md">
        <Tabs isFitted variant="enclosed">
          <TabList mb="4">
            <Tab>Регистрация</Tab>
            <Tab>Вход</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <Register />
            </TabPanel>
            <TabPanel p={0}>
              <Login />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default Auth; 
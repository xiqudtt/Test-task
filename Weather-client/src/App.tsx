import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/Auth/AuthPage';
import WeatherPage from './pages/Weather/WeatherPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/weather"
              element={
                <ProtectedRoute>
                  <WeatherPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/weather" replace />} />
            <Route path="*" element={<Navigate to="/weather" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App;

import { MotionConfig } from 'framer-motion';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { setupApi } from './services/api';
import './index.css';

setupApi().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* reducedMotion="user": Framer Motion honours prefers-reduced-motion everywhere */}
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </MotionConfig>
    </StrictMode>,
  );
});

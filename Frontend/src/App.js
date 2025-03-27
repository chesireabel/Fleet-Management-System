import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import routes from './routes.js';
import axios from 'axios';

// Import TokenManager from Login component
import { TokenManager } from './views/pages/login';

// Lazy-loaded components
const LandingPage = React.lazy(() => import('./views/pages/landingPage'));
const Login = React.lazy(() => import('./views/pages/login'));
const Signup = React.lazy(() => import('./views/pages/signup'));
const DriverPage = React.lazy(() => import('./views/pages/DriverPage').catch((error) => {
  console.error('Detailed DriverPage Import Error:', {
    message: error.message,
    stack: error.stack,
    errorType: error.constructor.name,
    importPath: './views/pages/DriverPage'
  });
  return { 
    default: () => (
      <div>
        Page Load Error
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  };
}));
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Configuration for route protection and token mapping
const ROUTE_ROLE_MAP = {
  '/driver': 'driver',
  '/dashboard': 'fleet_manager',
  '/maintenance/dashboard': 'maintenance_team',
  '/finance/dashboard': 'finance_team',
  '/senior-management/dashboard': 'senior_management'
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme) || 'light';

  useEffect(() => {
    // Axios interceptor for adding role-specific tokens
    const interceptor = axios.interceptors.request.use(config => {
      const userRole = localStorage.getItem('userRole');
      const token = TokenManager.getCurrentToken(userRole);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    }, error => {
      return Promise.reject(error);
    });

    // Theme configuration logic
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];
    
    if (theme) {
      setColorMode(theme);
    } else if (storedTheme) {
      setColorMode(storedTheme);
    }

    // Cleanup interceptor
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [setColorMode, storedTheme]);

  // Enhanced Protected Route Component
  const ProtectedRoute = ({ children, path }) => {
    const userRole = ROUTE_ROLE_MAP[path];
    
    // Validate token for specific role
    const isValidToken = userRole 
      ? TokenManager.validateTokenForRole(userRole)
      : false;
    
    if (!isValidToken) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Driver Route */}
            <Route 
              path="/driver/*" 
              element={
                <ProtectedRoute path="/driver">
                  <DriverPage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Routes with DefaultLayout */}
            <Route element={<DefaultLayout />}>
              {routes
                .filter(route => 
                  ![
                    '/', 
                    '/login', 
                    '/signup', 
                    '/driver'
                  ].includes(route.path)
                ) 
                .map((route, idx) => (
                  route.index ? (
                    <Route 
                      index
                      key={idx}
                      path={route.path}
                      element={
                        <ProtectedRoute path={route.path}>
                          {route.element}
                        </ProtectedRoute>
                      }
                    />
                  ) : (
                    <Route
                      key={idx}
                      path={route.path}
                      element={
                        <ProtectedRoute path={route.path}>
                          {route.element}
                        </ProtectedRoute>
                      }
                    />
                  )
                ))}
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
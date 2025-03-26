import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import routes from './routes.js';




const LandingPage = React.lazy(() => import('./views/pages/landingPage'));
const Login = React.lazy(() => import('./views/pages/login'));
const Signup = React.lazy(() => import('./views/pages/signup'));
const DriverPage = React.lazy(() => import('./views/pages/DriverPage').catch((error)=> {
  console.error('Detailed DriverPage Import Error:', {
  message: error.message,
  stack: error.stack,
  errorType: error.constructor.name,
  importPath: './views/pages/DriverPage'

  });
  return {default: () => <div>Page Load Error
    <pre>{JSON.stringify(error, null, 2)}</pre>
  </div>};
})
);
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));



const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];
    
    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet() && storedTheme) {
      setColorMode(storedTheme);
    }
  }, [setColorMode, isColorModeSet, storedTheme]);

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
            {/* Routes that should NOT use DefaultLayout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/driver/*" element={<DriverPage />} />

            {/* Routes that SHOULD use DefaultLayout */}
            <Route element={<DefaultLayout />}>
              {routes
                 .filter(route => !['/', '/login','/signup','/driver'].includes(route.path)) 
                 .map((route, idx) =>
                  route.index ? (
                    <Route 
                      index
                      key={idx}
                      path={route.path}
                      element={route.element}
                    />
                  ) : (
                    <Route
                      key={idx}
                      path={route.path}
                      element={route.element}
                    />
                  )
                )}
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
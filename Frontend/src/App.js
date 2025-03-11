import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import routes from './routes';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const DriverPage = React.lazy(() => import('./views/pages/DriverPage'));


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
            <Route path="/driver" element={<DriverPage />} />

            {/* Routes that SHOULD use DefaultLayout */}
            <Route element={<DefaultLayout />}>
              {routes
                .filter((route) => route.path !== '/driver') // Exclude /driver from DefaultLayout
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
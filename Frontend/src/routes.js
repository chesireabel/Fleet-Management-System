import React from 'react'
import { Suspense } from 'react'
import { CSpinner } from '@coreui/react'

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Vehicles = React.lazy(() => import('./views/dashboard/Vehicle'))
const VehicleTracker = React.lazy(() => import('./views/dashboard/VehicleTracker'))
const Drivers = React.lazy(() => import('./views/dashboard/Drivers'))
const Maintenance = React.lazy(() => import('./views/dashboard/maintenance'))
const Reports = React.lazy(() => import('./views/dashboard/reports'))


const withSuspense = (Component) => (props) => (
  <Suspense fallback={<CSpinner color="primary" />}>
    <Component {...props} />
  </Suspense>
)

const routes = [
  { 
    path: '/',
    index: true,
    name: 'Home',
    element: withSuspense(Dashboard)
  },
  { 
    path: '/dashboard',
    name: 'Dashboard',
    element: withSuspense(Dashboard)
  },
  { 
    path: '/vehicles',
    name: 'Vehicles',
    element: withSuspense(Vehicles)
  },
  { 
    path: '/tracking',
    name: 'Vehicle Tracking',
    element: withSuspense(VehicleTracker)
  },
  { 
    path: '/drivers',
    name: 'Drivers',
    element: withSuspense(Drivers)
  },
  { 
    path: '/maintenance',
    name: 'Maintenance',
    element: withSuspense(Maintenance)
  },
  { 
    path: '/reports',
    name: 'Analytics & Reports',
    element: withSuspense(Reports)
  }
]

export default routes
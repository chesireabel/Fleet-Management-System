import React from 'react'
import { Suspense } from 'react'
import { CSpinner } from '@coreui/react'

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Vehicles = React.lazy(() => import('./views/dashboard/Vehicle'))
const VehicleTracker = React.lazy(() => import('./views/dashboard/VehicleTracker'))
const Trips = React.lazy(() => import('./views/dashboard/tripsAssign'))
const Drivers = React.lazy(() => import('./views/dashboard/Drivers'))
const DriverPage = React.lazy(() => import('./views/pages/DriverPage'));

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
    path: '/trips',
    name: 'Trips',
    element: withSuspense(Trips)
  },
  { 
    path: '/drivers',
    name: 'Drivers',
    element: withSuspense(Drivers)
  },
  { 
    path: '/driver', 
    name: 'Driver Dashboard',
    element: withSuspense(DriverPage)
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
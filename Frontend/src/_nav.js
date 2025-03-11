import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  
  cilSpeedometer,cilPeople,cilCarAlt,cilSettings,cilLocationPin,
  cilChart
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    
  },

  {
    component: CNavItem,
    name: 'Vehicles',
    to: '/vehicles',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
    
  },
  {
    component: CNavItem,
    name: 'Track Vehicles',
    to: '/tracking',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    
  },
  {
    component: CNavItem,
    name: 'Trips',
    to: '/trips',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    
  },
  {
    component: CNavItem,
    name: 'Drivers',
    to: '/drivers',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    
  },
  {
  component: CNavItem,
  name: 'Maintenance',
  to: '/maintenance',
  icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  
},
{
  component: CNavItem,
  name: 'Reports',
  to: '/reports',
  icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
  
},

 
 
 
 
  
 
  
  
 
  
 
 
]

export default _nav

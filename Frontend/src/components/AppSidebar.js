import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'


// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
      <CSidebarBrand to="/">
  {/* Expanded Logo */}
  <img
    src="/assets/images/avatars/logo.jpeg"
    alt="Fleet Management Logo"
    className="sidebar-brand-full"
    style={{
      height: '32px',
      width: 'auto',
      maxWidth: '160px',
      objectFit: 'contain',
      padding: '4px 0' // Add spacing if needed
    }}
  />

  {/* Collapsed Icon */}
  <img
    src="/assets/images/avatars/logo.jpeg"
    alt="Company Icon"
    className="sidebar-brand-narrow"
    style={{
      height: '32px',
      width: '32px',
      objectFit: 'cover',
      borderRadius: '4px' // Optional styling
    }}
  />
</CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)

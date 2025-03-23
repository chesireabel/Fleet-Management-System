import React from 'react'
import { Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CTooltip
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
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
        <CSidebarBrand to="/" className="d-flex align-items-center justify-content-center" style={{ textDecoration: 'none' }}>
          {/* Expanded Text - Visible when sidebar is open */}
          <div className="sidebar-brand-full" style={{
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '1px',
            fontSize: '1.25rem',
            background: 'linear-gradient(45deg, #321fdb, #1aac83)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            <Link to='/dashboard'>
            Fleet Manager
            </Link>
          </div>

          {/* Collapsed Text - Visible when sidebar is folded */}
          <CTooltip content="Fleet Manager" placement="right">
            <div className="sidebar-brand-narrow" style={{
              transition: 'all 0.3s ease',
              fontWeight: '700',
              fontSize: '1.5rem',
              background: 'linear-gradient(45deg, #321fdb, #1aac83)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              FM
            </div>
          </CTooltip>
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
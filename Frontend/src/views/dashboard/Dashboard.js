import React from 'react'
import classNames from 'classnames'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilTruck,
  cilSettings, // Replace cilWrench with cilSettings or another valid icon
  cilSpeedometer,
  cilUser,
  cilCalendar,
  cilChartLine,
  cilCloudDownload
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  const fleetMetrics = [
    { title: 'Active Vehicles', value: '20', percent: 80, color: 'success' },
    { title: 'Idle Vehicles', value: '10', percent: 10, color: 'warning' },
    { title: 'Under Maintenance', value: '5', percent: 5, color: 'danger' },
    { title: 'Fuel Consumption', value: '1,200 L', percent: 60, color: 'info' },
    { title: 'Average Mileage', value: '45,000 km', percent: 75, color: 'primary' },
  ]

  const driverPerformance = [
    { title: 'Monday', value1: 85, value2: 15 },
    { title: 'Tuesday', value1: 90, value2: 10 },
    { title: 'Wednesday', value1: 78, value2: 22 },
    { title: 'Thursday', value1: 92, value2: 8 },
    { title: 'Friday', value1: 88, value2: 12 },
    { title: 'Saturday', value1: 80, value2: 20 },
    { title: 'Sunday', value1: 75, value2: 25 },
  ]

  const vehicleStatus = [
    { title: 'On Route', icon: cilTruck, value: 85 },
    { title: 'In Depot', icon: cilTruck, value: 15 },
  ]

  const maintenanceSchedule = [
    { title: 'Oil Change', icon: cilSettings, percent: 30, value: 'Due in 500 km' }, // Replace cilWrench with cilSettings
    { title: 'Tire Rotation', icon: cilSettings, percent: 50, value: 'Due in 1,000 km' }, // Replace cilWrench with cilSettings
    { title: 'Brake Check', icon: cilSettings, percent: 70, value: 'Due in 2,000 km' }, // Replace cilWrench with cilSettings
    { title: 'Engine Tune-Up', icon: cilSettings, percent: 90, value: 'Due in 5,000 km' }, // Replace cilWrench with cilSettings
  ]

  const fleetTableData = [
    {
      avatar: { src: avatar1, status: 'success' },
      driver: {
        name: 'John Doe',
        new: true,
        license: 'Valid until Jan 1, 2025',
      },
      vehicle: { name: 'Truck #101', type: 'Heavy Duty' },
      usage: {
        value: 85,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'success',
      },
      status: { name: 'On Route', icon: cilTruck },
      activity: '10 sec ago',
    },
    {
      avatar: { src: avatar2, status: 'danger' },
      driver: {
        name: 'Jane Smith',
        new: false,
        license: 'Valid until Jan 1, 2024',
      },
      vehicle: { name: 'Van #202', type: 'Light Duty' },
      usage: {
        value: 45,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'warning',
      },
      status: { name: 'In Depot', icon: cilTruck },
      activity: '5 minutes ago',
    },
    {
      avatar: { src: avatar3, status: 'warning' },
      driver: { name: 'Mike Johnson', new: true, license: 'Valid until Jan 1, 2026' },
      vehicle: { name: 'Truck #303', type: 'Heavy Duty' },
      usage: {
        value: 60,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'info',
      },
      status: { name: 'Under Maintenance', icon: cilSettings }, // Replace cilWrench with cilSettings
      activity: '1 hour ago',
    },
    {
      avatar: { src: avatar4, status: 'secondary' },
      driver: { name: 'Sarah Lee', new: true, license: 'Valid until Jan 1, 2025' },
      vehicle: { name: 'Truck #404', type: 'Heavy Duty' },
      usage: {
        value: 90,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'danger',
      },
      status: { name: 'On Route', icon: cilTruck },
      activity: 'Last month',
    },
    {
      avatar: { src: avatar5, status: 'success' },
      driver: {
        name: 'Chris Brown',
        new: true,
        license: 'Valid until Jan 1, 2024',
      },
      vehicle: { name: 'Van #505', type: 'Light Duty' },
      usage: {
        value: 70,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'primary',
      },
      status: { name: 'On Route', icon: cilTruck },
      activity: 'Last week',
    },
    {
      avatar: { src: avatar6, status: 'danger' },
      driver: {
        name: 'Emily Davis',
        new: true,
        license: 'Valid until Jan 1, 2025',
      },
      vehicle: { name: 'Truck #606', type: 'Heavy Duty' },
      usage: {
        value: 50,
        period: 'Jun 11, 2023 - Jul 10, 2023',
        color: 'success',
      },
      status: { name: 'In Depot', icon: cilTruck },
      activity: 'Last week',
    },
  ]

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="fleet-overview" className="card-title mb-0">
                Fleet Overview
              </h4>
              <div className="small text-body-secondary">January - July 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Week', 'Month'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {fleetMetrics.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
      
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Driver Performance & Vehicle Status</CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-info py-1 px-3">
                        <div className="text-body-secondary text-truncate small">On-Time Deliveries</div>
                        <div className="fs-5 fw-semibold">92%</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Delays</div>
                        <div className="fs-5 fw-semibold">8%</div>
                      </div>
                    </CCol>
                  </CRow>
                  <hr className="mt-0" />
                  {driverPerformance.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-prepend">
                        <span className="text-body-secondary small">{item.title}</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="info" value={item.value1} />
                        <CProgress thin color="danger" value={item.value2} />
                      </div>
                    </div>
                  ))}
                </CCol>
                <CCol xs={12} md={6} xl={6}>
                  <CRow>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Fuel Efficiency</div>
                        <div className="fs-5 fw-semibold">8.5 km/L</div>
                      </div>
                    </CCol>
                    <CCol xs={6}>
                      <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                        <div className="text-body-secondary text-truncate small">Total Mileage</div>
                        <div className="fs-5 fw-semibold">45,000 km</div>
                      </div>
                    </CCol>
                  </CRow>

                  <hr className="mt-0" />

                  {vehicleStatus.map((item, index) => (
                    <div className="progress-group mb-4" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">{item.value}%</span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="warning" value={item.value} />
                      </div>
                    </div>
                  ))}

                  <div className="mb-5"></div>

                  {maintenanceSchedule.map((item, index) => (
                    <div className="progress-group" key={index}>
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={item.icon} size="lg" />
                        <span>{item.title}</span>
                        <span className="ms-auto fw-semibold">
                          {item.value}{' '}
                          <span className="text-body-secondary small">({item.percent}%)</span>
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="success" value={item.percent} />
                      </div>
                    </div>
                  ))}
                </CCol>
              </CRow>

              <br />

              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      <CIcon icon={cilUser} />
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Driver</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Vehicle
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Usage</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Status
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Activity</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {fleetTableData.map((item, index) => (
                    <CTableRow v-for="item in tableItems" key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={item.avatar.src} status={item.avatar.status} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item.driver.name}</div>
                        <div className="small text-body-secondary text-nowrap">
                          <span>{item.driver.new ? 'New' : 'Experienced'}</span> | License:{' '}
                          {item.driver.license}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <div>{item.vehicle.name}</div>
                        <div className="small text-body-secondary">{item.vehicle.type}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">{item.usage.value}%</div>
                          <div className="ms-3">
                            <small className="text-body-secondary">{item.usage.period}</small>
                          </div>
                        </div>
                        <CProgress thin color={item.usage.color} value={item.usage.value} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={item.status.icon} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary text-nowrap">Last update</div>
                        <div className="fw-semibold text-nowrap">{item.activity}</div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard;
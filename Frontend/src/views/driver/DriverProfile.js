import { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/driver/profile')
      .then(response => response.json())
      .then(data => setDriver(data))
      .catch(error => console.error('Error fetching profile:', error));
  }, []);

  if (!driver) {
    return <p>Loading profile...</p>;
  }

  return (
    <CCard>
      <CCardHeader>
        <h2>Driver Profile</h2>
      </CCardHeader>
      <CCardBody>
        <p><strong>Name:</strong> {driver.name}</p>
        <p><strong>Email:</strong> {driver.email}</p>
        <p><strong>License:</strong> {driver.licenseNumber}</p>
      </CCardBody>
    </CCard>
  );
};

export default DriverProfile;

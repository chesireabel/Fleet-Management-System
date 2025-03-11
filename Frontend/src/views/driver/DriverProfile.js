import { CForm, CFormInput, CButton } from '@coreui/react';
import { useState } from 'react';

const DriverProfile = ({ onSubmit }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <CForm onSubmit={handleSubmit}>
      <div className="mb-3">
        <CFormInput
          type="text"
          name="name"
          placeholder="Full Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <CFormInput
          type="email"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          required
        />
      </div>
      <div className="mb-3">
        <CFormInput
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          required
        />
      </div>
      <CButton type="submit" color="primary">
        Update Profile
      </CButton>
    </CForm>
  );
};

export default DriverProfile;
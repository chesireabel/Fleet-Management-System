import { CForm, CFormSelect, CFormTextarea, CButton } from '@coreui/react';
import { useState } from 'react';

const IssueReportForm = ({ onSubmit }) => {
  const [issue, setIssue] = useState({
    description: '',
    severity: 'low'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(issue);
  };

  return (
    <CForm onSubmit={handleSubmit}>
      <div className="mb-3">
        <CFormSelect
          name="severity"
          value={issue.severity}
          onChange={(e) => setIssue({ ...issue, severity: e.target.value })}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </CFormSelect>
      </div>
      <div className="mb-3">
        <CFormTextarea
          name="description"
          placeholder="Issue description"
          value={issue.description}
          onChange={(e) => setIssue({ ...issue, description: e.target.value })}
          required
        />
      </div>
      <CButton type="submit" color="primary">
        Report Issue
      </CButton>
    </CForm>
  );
};

export default IssueReportForm;
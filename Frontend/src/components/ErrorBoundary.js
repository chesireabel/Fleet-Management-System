// src/components/ErrorBoundary.js
import React from 'react';
import { CAlert, CButton, CContainer } from '@coreui/react';

export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <CContainer className="min-vh-100 d-flex align-items-center">
          <div className="w-100">
            <CAlert color="danger" className="text-center">
              <h2>🚨 Application Error</h2>
              <p className="h4">{this.state.error?.message}</p>
              <div className="mt-4">
                <CButton color="primary" onClick={this.handleReload}>
                  Reload Application
                </CButton>
              </div>
              <details className="mt-4 text-start">
                <summary>Error Details</summary>
                <pre className="text-muted mt-2">
                  {this.state.error?.stack}
                </pre>
                <pre className="text-muted">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </CAlert>
          </div>
        </CContainer>
      );
    }
    return this.props.children;
  }
}
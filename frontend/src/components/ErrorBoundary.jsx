import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Įvyko klaida
            </h4>
            <p>Įvyko klaida rodant šį puslapį. Pabandykite perkrauti puslapį arba bandykite vėliau.</p>
            <hr />
            <div className="d-flex gap-2">
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Perkrauti puslapį
              </button>
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Grįžti atgal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

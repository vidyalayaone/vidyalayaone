import React, { useEffect } from 'react';

const SchoolNotFoundError: React.FC = () => {
  useEffect(() => {
    // Override the document title and apply basic styles
    document.title = "This site can't be reached";
    
    // Apply basic styles to body
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = '#f9f9f9';
    document.body.style.color = '#333';
    
    return () => {
      // Cleanup on unmount
      document.title = 'School Management System';
      document.body.style.fontFamily = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.background = '';
      document.body.style.color = '';
    };
  }, []);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      padding: '20px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        color: '#d93025',
        fontSize: '20px',
        marginBottom: '16px',
        fontWeight: 'normal'
      }}>
        This site can't be reached
      </h1>
      
      <p style={{ lineHeight: '1.5', margin: '12px 0' }}>
        <strong>{window.location.hostname}</strong>'s server IP address could not be found.
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <p style={{ lineHeight: '1.5', margin: '12px 0' }}>Try:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li style={{ margin: '8px 0' }}>Checking the connection</li>
          <li style={{ margin: '8px 0' }}>Checking the proxy and the firewall</li>
          <li style={{ margin: '8px 0' }}>Running Network Diagnostics</li>
        </ul>
      </div>
      
      <div style={{
        color: '#5f6368',
        fontSize: '14px',
        marginTop: '20px'
      }}>
        ERR_NAME_NOT_RESOLVED
      </div>
    </div>
  );
};

export default SchoolNotFoundError;

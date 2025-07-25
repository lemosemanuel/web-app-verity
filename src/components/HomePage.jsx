import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const styles = {
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
      padding: '20px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      width: '100%',
      border: '1px solid #E6FFE6',
    },
    imagesContainer: {
      display: 'flex',
      gap: '16px',
      marginBottom: '32px',
    },
    imageWrapper: {
      position: 'relative',
      flex: 1,
      width: '100%',
    },
    image: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
      display: 'block',
    },
    overlayIcon: {
      position: 'absolute',
      top: '-8px',    // Adjusted to bring certificate icon closer to top edge
      left: '8px',
      width: '180px',
      height: '180px',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '16px',
    },
    subheading: {
      fontSize: '0.875rem',
      textAlign: 'center',
      color: '#666666',
      marginBottom: '24px',
    },
    steps: {
      listStyle: 'none',
      padding: 0,
      margin: '0 auto 24px',
      maxWidth: '300px',
    },
    stepItem: {
      fontSize: '0.875rem',
      color: '#333333',
      marginBottom: '8px',
      textAlign: 'center',
    },
    footerText: {
      fontSize: '0.75rem',
      textAlign: 'center',
      color: '#999999',
      marginBottom: '24px',
    },
    buttonsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '16px',
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#111111',
      backgroundColor: '#D1FF5C',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.imagesContainer}>
          {/* Primera imagen normal */}
          <div style={styles.imageWrapper}>
            <img
              src="/assets/image1.jpg"
              alt="Capture product"
              style={styles.image}
            />
          </div>

          {/* Segunda imagen con overlay de certificado */}
          <div style={styles.imageWrapper}>
            <img
              src="/assets/image2.png"
              alt="Product detail"
              style={styles.image}
            />
            {/* PNG de certificado arriba a la izquierda */}
            <img
              src="/assets/authentic.png"
              alt="Certificate Icon"
              style={styles.overlayIcon}
            />
          </div>
        </div>

        <h1 style={styles.heading}>
          AI authentication in under 30 seconds. Boost trust. Reduce fraud. Try it now.
        </h1>

        <p style={styles.subheading}>
          Only 30 businesses will get early access to Verity AI in 2025
        </p>

        <ul style={styles.steps}>
          <li style={styles.stepItem}>1. Upload images</li>
          <li style={styles.stepItem}>2. AI authenticates in under 30 seconds</li>
          <li style={styles.stepItem}>3. Receive certificate</li>
        </ul>

        <p style={styles.footerText}>95+% accuracy, live in Shopify app store</p>

        <div style={styles.buttonsContainer}>
          <button
            style={styles.button}
            onClick={() => navigate('/products')}
          >
            Show me how to authenticate
          </button>
          <button
            style={styles.button}
            onClick={() => navigate('/beta-signup')}
          >
            I’m a Business – Join the Beta
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

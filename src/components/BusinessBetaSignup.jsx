import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from './urls';

const BusinessBetaSignup = () => {
  const navigate = useNavigate();

  const styles = {
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
      padding: '20px',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      maxWidth: '1000px',
      width: '100%',
      display: 'flex',
      gap: '32px',
    },
    leftColumn: { flex: 1, border: '2px solid #D1FF5C', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
    certHeader: { fontSize: '1.25rem', fontWeight: '500', textAlign: 'center' },
    imageWrapper: { position: 'relative', width: '100%', paddingBottom: '100%', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#EFEFEF' },
    certImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    logo: { width: '80px', marginTop: 'auto', alignSelf: 'center' },
    disclaimer: { fontSize: '0.625rem', color: '#888', marginTop: '8px', lineHeight: '1.2' },
    rightColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
    title: { fontSize: '1.25rem', fontWeight: '500', textAlign: 'center' },
    subtitle: { fontSize: '0.875rem', textAlign: 'center', color: '#666' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #D1FF5C', fontSize: '0.875rem', outline: 'none' },
    select: { padding: '12px', borderRadius: '6px', border: '1px solid #D1FF5C', fontSize: '0.875rem', outline: 'none', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20...%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' },
    button: { marginTop: '16px', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', backgroundColor: '#D1FF5C', color: '#111' },
    footerText: { fontSize: '0.75rem', color: '#999', textAlign: 'center', marginTop: '8px' },
  };

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [productPref, setProductPref] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(ENDPOINTS.betaSignups, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, email, productPref }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error: ' + (err.error || res.statusText));
        return;
      }

      const { id, message } = await res.json();
      alert(message + ' (ID: ' + id + ')');
      navigate('/products');
    } catch (error) {
      console.error(error);
      alert('Network error sending request.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.leftColumn}>
          <h2 style={styles.certHeader}>Certificate Of Authenticity</h2>
          <div style={styles.imageWrapper}>
            <img src="/assets/image2.png" alt="Certified" style={styles.certImage} />
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#D1FF5C', borderRadius: '4px', padding: '2px 6px', fontSize: '0.75rem' }}>
              Authentic
            </div>
          </div>
          <p>Date of authentication: 5/9/2025</p>
          <p>Brand: Sleaper</p>
          <img src="/assets/verity-logo.png" alt="Verity AI" style={styles.logo} />
          <p>This item has been deemed authentic by Verity AI.</p>
          <p>Verity AI provides a financial guarantee for this certificate.</p>
          <p style={styles.disclaimer}>
            Verity AI is not affiliated with any of the brands authenticated. Verity AI’s authentication service is based solely on analysis of imagery data; data provided by client. Brands authenticated are not responsible for any losses.
          </p>
        </div>

        <div style={styles.rightColumn}>
          <h2 style={styles.title}>Welcome to Verity Beta</h2>
          <p style={styles.subtitle}>Early Access Request</p>
          <p style={styles.subtitle}>Be among the first 30 businesses to boost trust and scale authentication with AI</p>
          <p style={styles.subtitle}>Takes 30 seconds. You’ll receive your Verity Certified Store pack within 24 hours.</p>

          <form style={styles.form} onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="text"
              placeholder="Business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select
              style={styles.select}
              value={productPref}
              onChange={(e) => setProductPref(e.target.value)}
              required
            >
              <option value="" disabled>Product preference</option>
              <option value="fashion">Fashion</option>
              <option value="luxury">Luxury</option>
              <option value="accessories">Accessories</option>
            </select>
            <button type="submit" style={styles.button}>Request Beta Access</button>
          </form>

          <p style={styles.footerText}>
            Limited beta spots available. Join before July 31 to become a Verity Certified Store. We’ll be in touch within 24 hours with your beta onboarding link, certificate embed, and demo guide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessBetaSignup;

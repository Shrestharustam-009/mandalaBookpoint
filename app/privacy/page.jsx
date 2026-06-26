'use client';

import { useAuth } from '@/app/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../home.css';

export default function PrivacyPage() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <main className="container" style={{ padding: '80px 24px', minHeight: '60vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px', color: '#111827', fontFamily: 'Sora, sans-serif' }}>Privacy Policy</h1>
        <div style={{ color: '#4b5563', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '16px' }}>At Mandala Book Point, we collect information to provide better services to our users. This includes basic details like your name, email address, and shipping address when you create an account or make a purchase, as well as data on how you interact with our website to help us improve your browsing experience.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>2. How We Use Information</h2>
          <p style={{ marginBottom: '16px' }}>We use the information we collect from all of our services to provide, maintain, protect and improve them, to develop new ones, and to protect Mandala Book Point and our users. We also use this information to offer you tailored content – like giving you more relevant book recommendations.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>3. Information We Share</h2>
          <p style={{ marginBottom: '16px' }}>We do not share personal information with companies, organizations and individuals outside of Mandala Book Point unless one of the following circumstances applies: with your consent, for external processing (like payment gateways and shipping partners), or for legal reasons.</p>

          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>4. Data Security</h2>
          <p style={{ marginBottom: '16px' }}>We work hard to protect Mandala Book Point and our users from unauthorized access to or unauthorized alteration, disclosure or destruction of information we hold. We review our information collection, storage and processing practices to guard against unauthorized access to our systems.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

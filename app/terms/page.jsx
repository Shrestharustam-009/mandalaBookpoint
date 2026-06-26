'use client';

import { useAuth } from '@/app/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../home.css';

export default function TermsPage() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <main className="container" style={{ padding: '80px 24px', minHeight: '60vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px', color: '#111827', fontFamily: 'Sora, sans-serif' }}>Terms of Service</h1>
        <div style={{ color: '#4b5563', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>1. Introduction</h2>
          <p style={{ marginBottom: '16px' }}>Welcome to Mandala Book Point. By using our website and purchasing our books or services, you agree to these Terms of Service. Please read them carefully to understand your rights and responsibilities.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>2. Use of Our Services</h2>
          <p style={{ marginBottom: '16px' }}>You must follow any policies made available to you within the Services. Don't misuse our Services. For example, don't interfere with our Services or try to access them using a method other than the interface and the instructions that we provide. We may suspend or stop providing our Services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>3. Purchases and Payments</h2>
          <p style={{ marginBottom: '16px' }}>All prices displayed on Mandala Book Point are in local currency and are subject to change without notice. We make every effort to ensure the accuracy of the pricing and availability of our books. Payment must be received in full before your order can be processed and shipped.</p>

          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>4. Your Account</h2>
          <p style={{ marginBottom: '16px' }}>You may need a Mandala Book Point Account in order to use some of our Services. You are responsible for keeping your password confidential. You are also responsible for all activities that happen under your account.</p>

          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>5. Modifying and Terminating our Services</h2>
          <p style={{ marginBottom: '16px' }}>We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

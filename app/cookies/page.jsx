'use client';

import { useAuth } from '@/app/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../home.css';

export default function CookiesPage() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <main className="container" style={{ padding: '80px 24px', minHeight: '60vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '24px', color: '#111827', fontFamily: 'Sora, sans-serif' }}>Cookie Policy</h1>
        <div style={{ color: '#4b5563', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '24px' }}>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>1. What Are Cookies</h2>
          <p style={{ marginBottom: '16px' }}>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login, language, font size, and other display preferences) over a period of time, so you don't have to keep re-entering them whenever you come back to the site or browse from one page to another.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>2. How We Use Cookies</h2>
          <p style={{ marginBottom: '16px' }}>Mandala Book Point uses cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate (e.g., keeping you logged in or keeping track of your shopping cart). Other cookies enable us to track and target the interests of our users to enhance the experience on our website.</p>
          
          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>3. Types of Cookies We Use</h2>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Essential Cookies:</strong> Strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
            <li style={{ marginBottom: '8px' }}><strong>Performance and Functionality Cookies:</strong> Used to enhance the performance and functionality of our website but are non-essential to their use.</li>
            <li style={{ marginBottom: '8px' }}><strong>Analytics and Customization Cookies:</strong> Collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are.</li>
          </ul>

          <h2 style={{ fontSize: '24px', margin: '32px 0 16px', color: '#111827' }}>4. Controlling Cookies</h2>
          <p style={{ marginBottom: '16px' }}>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/app/auth-context';
import siteConfig from '@/config/siteConfig';
import Link from 'next/link';
import { BookOpen, Users, MapPin, Phone, Mail, Globe } from 'lucide-react';
import '../home.css';

export default function AboutPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <main className="container" style={{ padding: '60px 0' }}>
        <section style={{ padding: '100px 24px', background: 'white', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '24px', color: 'var(--accent)', fontWeight: 600, fontSize: '14px', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              About {siteConfig.siteName}
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: '1.2', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>
              Your Gateway to <span style={{ color: 'var(--accent)' }}>Literary Excellence</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '40px' }}>
              More than just a bookstore, we are a destination for bibliophiles. At {siteConfig.siteName}, we meticulously curate a diverse collection of literature to inspire, educate, and transport you. Our mission is to bridge the gap between extraordinary stories and passionate readers.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/books" className="btn-primary-modern" style={{ padding: '16px 32px', fontSize: '16px' }}>
                Browse Collection
              </Link>
              <Link href="/blog" className="btn-secondary-modern" style={{ padding: '16px 32px', fontSize: '16px' }}>
                Read Our Blog
              </Link>
            </div>
          </div>
        </section>

        <section className="features-section" style={{ padding: '80px 24px', marginTop: '40px' }}>
          <div className="container">
            <div className="section-header-modern centered">
              <h2 className="section-title-modern">Our Values</h2>
              <p className="section-description">
                We focus on readers first, with a simple goal: help you find your next favourite book.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon"><BookOpen size={40} strokeWidth={1.5} /></div>
                <h3 className="feature-title">Curated Catalog</h3>
                <p className="feature-description">
                  Every title is hand‑selected to ensure quality, relevance, and a diverse
                  range of voices and perspectives.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"><Users size={40} strokeWidth={1.5} /></div>
                <h3 className="feature-title">Reader Community</h3>
                <p className="feature-description">
                  Reviews and recommendations from real readers help you decide what to read next.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"><MapPin size={40} strokeWidth={1.5} /></div>
                <h3 className="feature-title">Local Focus</h3>
                <p className="feature-description">
                  Based in {siteConfig.address}, we understand local readers and regional interests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 24px 80px' }}>
          <div className="container" style={{ maxWidth: 800 }}>
            <h2 className="section-title-modern" style={{ fontSize: 28, marginBottom: 16 }}>
              Get in touch
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>
              Have a question, suggestion, or partnership idea? We'd love to hear from you.
            </p>
            <div style={{
              background: 'white',
              border: '1px solid var(--border)',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <MapPin size={24} color="var(--accent)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Address</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{siteConfig.address}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <Phone size={24} color="var(--accent)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Phone</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{siteConfig.phone}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <Mail size={24} color="var(--accent)" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Email</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{siteConfig.email}</p>
                </div>
              </div>

              {siteConfig.website && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <Globe size={24} color="var(--accent)" style={{ marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Website</h4>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{siteConfig.website}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}


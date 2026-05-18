'use client';

import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import siteConfig from '@/config/siteConfig';
import Link from 'next/link';
import '../home.css';

export default function AboutPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <main className="container" style={{ padding: '60px 0' }}>
        <section className="hero-modern" style={{ minHeight: 'auto', padding: '40px 24px' }}>
          <div className="hero-content-modern">
            <div className="hero-badge">About {siteConfig.siteName}</div>
            <h1 className="hero-title-modern">
              A modern digital library
              <span className="hero-highlight"> built for readers</span>
            </h1>
            <p className="hero-subtitle-modern">
              {siteConfig.siteName} is a curated online bookstore where readers can discover,
              review, and purchase books from a wide range of genres. Our mission is to make
              great stories and knowledge accessible to everyone.
            </p>
            <div className="hero-cta-group">
              <Link href="/books" className="btn-primary-modern">
                Browse Collection
              </Link>
              <Link href="/blog" className="btn-secondary-modern">
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
                <div className="feature-icon">📚</div>
                <h3 className="feature-title">Curated Catalog</h3>
                <p className="feature-description">
                  Every title is hand‑selected to ensure quality, relevance, and a diverse
                  range of voices and perspectives.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3 className="feature-title">Reader Community</h3>
                <p className="feature-description">
                  Reviews and recommendations from real readers help you decide what to read next.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3 className="feature-title">Local Focus</h3>
                <p className="feature-description">
                  Based in {siteConfig.address}, we understand local readers and regional interests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 24px 40px' }}>
          <div className="container" style={{ maxWidth: 900 }}>
            <h2 className="section-title-modern" style={{ fontSize: 28, marginBottom: 16 }}>
              Get in touch
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Have a question, suggestion, or partnership idea? We'd love to hear from you.
            </p>
            <div style={{
              background: 'var(--bg-secondary, #f9fafb)',
              padding: '24px',
              borderRadius: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}>
              {`MANDALA BOOK POINT
${siteConfig.address}
Tel  : ${siteConfig.phone}
E-mail : ${siteConfig.email}
Website : ${siteConfig.website || 'www.mandalabookpoint.com'}
Follow us: Twitter | Instagram | Facebook | YouTube`}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


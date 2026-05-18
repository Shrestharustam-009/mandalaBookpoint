'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import siteConfig from '@/config/siteConfig';
import '../../home.css';

export default function BlogPostPage() {
  const { isAuthenticated, user } = useAuth();
  const params = useParams();
  const { slug } = params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await api.blog.getBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <main className="container" style={{ padding: '60px 0' }}>
        {loading ? (
          <p>Loading article...</p>
        ) : !post ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h1>Post not found</h1>
            <p>The blog post you are looking for does not exist.</p>
            <Link href="/blog" className="btn-primary-modern" style={{ marginTop: 16 }}>
              ← Back to Blog
            </Link>
          </div>
        ) : (
          <article style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ marginBottom: 12, color: 'var(--text-light)', fontSize: 14 }}>
              <Link href="/blog" style={{ textDecoration: 'none', color: 'var(--accent)' }}>
                ← Back to Blog
              </Link>
            </p>
            <h1 className="section-title-modern" style={{ fontSize: 32, marginBottom: 8 }}>
              {post.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              By {post.author || siteConfig.siteName}
            </p>
            <p style={{ color: 'var(--text-light)', marginBottom: 24, fontSize: 14 }}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
              }}
            >
              {post.content}
            </div>
          </article>
        )}
      </main>
    </>
  );
}


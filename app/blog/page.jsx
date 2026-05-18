'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import siteConfig from '@/config/siteConfig';
import '../home.css';

export default function BlogListPage() {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await api.blog.getAll();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />

      <main className="container" style={{ padding: '60px 0' }}>
        <section className="hero-modern" style={{ minHeight: 'auto', padding: '40px 24px' }}>
          <div className="hero-content-modern">
            <div className="hero-badge">Blog</div>
            <h1 className="hero-title-modern">
              Insights, updates,
              <span className="hero-highlight"> and reading tips</span>
            </h1>
            <p className="hero-subtitle-modern">
              Stories from the {siteConfig.siteName} team about books, reading culture,
              product updates, and more.
            </p>
          </div>
        </section>

        <section style={{ padding: '40px 24px 0' }}>
          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p>No blog posts have been published yet.</p>
          ) : (
            <div className="featured-grid">
              {posts.map((post) => (
                <article key={post.id} className="featured-card">
                  <div className="featured-card-content">
                    <div className="featured-badge">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    <h2 className="featured-card-title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="featured-card-author">
                      {post.author || siteConfig.siteName}
                    </p>
                    <p className="featured-card-description">
                      {post.excerpt ||
                        (post.content ? `${post.content.substring(0, 150)}...` : '')}
                    </p>
                    <div className="featured-card-footer">
                      <Link href={`/blog/${post.slug}`} className="featured-card-link">
                        Read Article
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}


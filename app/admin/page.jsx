'use client';

import { db } from '@/lib/db';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Books',
      value: db.books.getAll().length,
    },
    {
      label: 'Total Categories',
      value: db.categories.getAll().length,
    },
    {
      label: 'Total Users',
      value: db.users.getAll().length,
    },
    {
      label: 'Total Reviews',
      value: db.reviews.getAll().length,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Welcome to Admin Dashboard</h1>

      <div className="admin-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Quick Actions</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/admin/categories" className="btn-primary">
            Manage Categories
          </a>
          <a href="/admin/books" className="btn-primary">
            Manage Books
          </a>
          <a href="/admin/popups" className="btn-primary">
            Manage Popups
          </a>
          <a href="/admin/newsletter" className="btn-primary">
            View Newsletter
          </a>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">System Information</div>
        <table className="admin-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>Books in Database</td>
              <td>{db.books.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Active Categories</td>
              <td>{db.categories.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Registered Users</td>
              <td>{db.users.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Newsletter Subscribers</td>
              <td>{db.newsletter.getAll().length}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

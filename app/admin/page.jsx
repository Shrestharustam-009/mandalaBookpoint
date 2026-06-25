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

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a href="/admin/categories" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
            Manage Categories
          </a>
          <a href="/admin/books" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
            Manage Books
          </a>
          <a href="/admin/popups" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
            Manage Popups
          </a>
          <a href="/admin/newsletter" className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)] whitespace-nowrap">
            View Newsletter
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">System Information</h2>
        <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Books in Database</td>
              <td className="align-middle px-6 py-4">{db.books.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Active Categories</td>
              <td className="align-middle px-6 py-4">{db.categories.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Registered Users</td>
              <td className="align-middle px-6 py-4">{db.users.getAll().length}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Newsletter Subscribers</td>
              <td className="align-middle px-6 py-4">{db.newsletter.getAll().length}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
  );
}

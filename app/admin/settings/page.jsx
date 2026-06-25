'use client';

import siteConfig from '@/config/siteConfig';

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Admin Settings</h1>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Site Configuration</h2>
        <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Site Name</td>
              <td className="align-middle px-6 py-4">{siteConfig.siteName}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Description</td>
              <td className="align-middle px-6 py-4">{siteConfig.siteDescription}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Email</td>
              <td className="align-middle px-6 py-4">{siteConfig.email}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Phone</td>
              <td className="align-middle px-6 py-4">{siteConfig.phone}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Address</td>
              <td className="align-middle px-6 py-4">{siteConfig.address}</td>
            </tr>
          </tbody>
        </table></div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Currency Settings</h2>
        <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Primary Currency</td>
              <td className="align-middle px-6 py-4">{siteConfig.primaryCurrency} ({siteConfig.primaryCurrencySymbol})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Secondary Currency</td>
              <td className="align-middle px-6 py-4">{siteConfig.secondaryCurrency} ({siteConfig.secondaryCurrencySymbol})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }} className="align-middle px-6 py-4">Exchange Rate</td>
              <td className="align-middle px-6 py-4">1 {siteConfig.secondaryCurrency} = {siteConfig.exchangeRate} {siteConfig.primaryCurrency}</td>
            </tr>
          </tbody>
        </table></div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Payment Methods</h2>
        <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
          <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(siteConfig.paymentMethods).map(([key, method]) => (
              <tr key={key} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                <td className="align-middle px-6 py-4">{method.name}</td>
                <td className="align-middle px-6 py-4">
                  <span style={{
                    color: method.enabled ? '#10b981' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    {method.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Bulk Discount Rules</h2>
        <div className="overflow-x-auto w-full"><table className="w-full min-w-max text-left border-collapse">
          <thead className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount (%)</th>
            </tr>
          </thead>
          <tbody>
            {siteConfig.bulkDiscounts.map((rule, index) => (
              <tr key={index} className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
                <td className="align-middle px-6 py-4">{rule.quantity}+ books</td>
                <td className="align-middle px-6 py-4">{rule.discountPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50 mb-8">
        <p style={{ color: '#6b7280', margin: 0 }}>
          To edit these settings, please modify the configuration file at <code>/config/siteConfig.js</code>
        </p>
      </div>
    </div>
  );
}

'use client';

import siteConfig from '@/config/siteConfig';

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Admin Settings</h1>

      <div className="admin-card">
        <div className="admin-card-title">Site Configuration</div>
        <table className="admin-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>Site Name</td>
              <td>{siteConfig.siteName}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Description</td>
              <td>{siteConfig.siteDescription}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Email</td>
              <td>{siteConfig.email}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Phone</td>
              <td>{siteConfig.phone}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Address</td>
              <td>{siteConfig.address}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Currency Settings</div>
        <table className="admin-table">
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>Primary Currency</td>
              <td>{siteConfig.primaryCurrency} ({siteConfig.primaryCurrencySymbol})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Secondary Currency</td>
              <td>{siteConfig.secondaryCurrency} ({siteConfig.secondaryCurrencySymbol})</td>
            </tr>
            <tr>
              <td style={{ fontWeight: '600' }}>Exchange Rate</td>
              <td>1 {siteConfig.secondaryCurrency} = {siteConfig.exchangeRate} {siteConfig.primaryCurrency}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Payment Methods</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(siteConfig.paymentMethods).map(([key, method]) => (
              <tr key={key}>
                <td>{method.name}</td>
                <td>
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
        </table>
      </div>

      <div className="admin-card">
        <div className="admin-card-title">Bulk Discount Rules</div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Discount (%)</th>
            </tr>
          </thead>
          <tbody>
            {siteConfig.bulkDiscounts.map((rule, index) => (
              <tr key={index}>
                <td>{rule.quantity}+ books</td>
                <td>{rule.discountPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <p style={{ color: '#6b7280', margin: 0 }}>
          To edit these settings, please modify the configuration file at <code>/config/siteConfig.js</code>
        </p>
      </div>
    </div>
  );
}

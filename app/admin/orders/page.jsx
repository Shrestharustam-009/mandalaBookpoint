'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await api.orders.getAll();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleViewOrder = async (orderId) => {
    try {
      setModalLoading(true);
      const fullOrder = await api.orders.getById(orderId);
      setSelectedOrder(fullOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    } finally {
      setModalLoading(false);
    }
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print invoices.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.id}</title>
          <style>
            body { font-family: 'Outfit', 'Inter', sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f3f4f6; text-align: left; padding: 12px; font-weight: 600; font-size: 14px; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .total { text-align: right; font-size: 18px; font-weight: bold; color: #111827; margin-top: 20px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Mandala Book Point</div>
              <div style="font-size: 12px; margin-top: 5px; color: #4b5563;">Kantipath, Kathmandu, Nepal</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 20px; font-weight: bold; color: #374151;">INVOICE</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">Order ID: #${order.id}</div>
              <div style="font-size: 12px; color: #6b7280;">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div class="invoice-details">
            <div>
              <div class="section-title">Bill To:</div>
              <div><strong>Name:</strong> ${order.customerName}</div>
              <div><strong>Email:</strong> ${order.customerEmail}</div>
              <div><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</div>
            </div>
            <div style="text-align: right;">
              <div class="section-title">Shipping Address:</div>
              <div style="white-space: pre-line; max-width: 300px; font-style: italic;">${order.shippingAddress}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th style="text-align: right;">Price (NPR)</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total (NPR)</th>
              </tr>
            </thead>
            <tbody>
              ${(order.orderItems || []).map(item => `
                <tr>
                  <td>${item.title || ('Book #' + item.bookId)}</td>
                  <td style="text-align: right;">NPR ${parseFloat(item.price).toFixed(2)}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">NPR ${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">Grand Total: NPR ${parseFloat(order.totalAmount).toFixed(2)}</div>
          
          <div class="footer">
            Thank you for shopping at Mandala Book Point!<br>
            If you have any questions, please contact support@mandalabookpoint.com
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Orders Management</h1>

      <div className="admin-card">
        {orders.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div><strong>{order.customerName || order.customer}</strong></div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.customerEmail}</div>
                  </td>
                  <td>NPR {parseFloat(order.totalAmount || order.amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${order.status?.toLowerCase() === 'paid' ? 'status-paid' : 'status-pending'}`} style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: order.status?.toLowerCase() === 'paid' ? '#d1fae5' : '#fee2e2',
                      color: order.status?.toLowerCase() === 'paid' ? '#065f46' : '#991b1b'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ marginRight: '5px', padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-secondary"
                      style={{ padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => handlePrint(order)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            No orders yet.
          </p>
        )}
      </div>

      {/* Modern Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="admin-card" style={{
            width: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Order Details #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px', fontSize: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Customer Information</h4>
                <div><strong>Name:</strong> {selectedOrder.customerName}</div>
                <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                <div><strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}</div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>Order Summary</h4>
                <div><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div><strong>Status:</strong> <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: selectedOrder.status?.toLowerCase() === 'paid' ? '#d1fae5' : '#fee2e2',
                  color: selectedOrder.status?.toLowerCase() === 'paid' ? '#065f46' : '#991b1b'
                }}>{selectedOrder.status}</span></div>
                <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'PACO Gateway'}</div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Shipping Address</h4>
              <div style={{ backgroundColor: '#f9fafb', padding: '12px', borderRadius: '6px', fontSize: '14px', fontStyle: 'italic', border: '1px solid #e5e7eb' }}>
                {selectedOrder.shippingAddress}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Items Purchased</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0' }}>Book Title</th>
                    <th style={{ textAlign: 'right', padding: '8px 0' }}>Price</th>
                    <th style={{ textAlign: 'center', padding: '8px 0' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px 0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 0' }}>{item.title || `Book #${item.bookId}`}</td>
                      <td style={{ textAlign: 'right', padding: '8px 0' }}>NPR {parseFloat(item.price).toFixed(2)}</td>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '8px 0' }}>NPR {(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px', marginTop: '15px', color: '#111827' }}>
                Grand Total: NPR {parseFloat(selectedOrder.totalAmount).toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
              <button className="btn-secondary" style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => handlePrint(selectedOrder)}>
                Print Invoice
              </button>
              <button className="btn-primary" style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

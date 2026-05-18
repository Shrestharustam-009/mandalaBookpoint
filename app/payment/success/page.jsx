'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import { currencyUtils } from '@/lib/configHelper';
import '../payment.css';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');

  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderAndVerify = async () => {
      try {
        // Fetch order details
        const orderData = await api.orders.getById(orderId);
        setOrder(orderData);

        // Verify payment status with PACO
        setVerifying(true);
        try {
          const statusResponse = await api.payment.getStatus(
            transactionId || null,
            orderId
          );
          setPaymentStatus(statusResponse?.status || 'UNKNOWN');
          
          // Re-fetch order to get updated status from verification
          const updatedOrder = await api.orders.getById(orderId);
          setOrder(updatedOrder);
        } catch (statusErr) {
          console.error('Payment verification error:', statusErr);
          // Still show the page even if verification fails
          setPaymentStatus(orderData?.status === 'paid' ? 'SUCCESS' : 'PENDING');
        } finally {
          setVerifying(false);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndVerify();
  }, [orderId, transactionId]);

  const getStatusDisplay = () => {
    const status = order?.status || 'pending';
    switch (status) {
      case 'paid':
        return { icon: '✅', color: '#10b981', text: 'Payment Successful!', subtitle: 'Thank you for your purchase. Your order has been confirmed.' };
      case 'pending':
        return { icon: '⏳', color: '#f59e0b', text: 'Payment Pending', subtitle: 'Your payment is being processed. We\'ll update your order once confirmed.' };
      case 'failed':
        return { icon: '❌', color: '#ef4444', text: 'Payment Failed', subtitle: 'There was an issue with your payment. Please try again.' };
      default:
        return { icon: '✅', color: '#10b981', text: 'Order Received!', subtitle: 'Your order has been received. Thank you!' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="payment-container">
        <div className="payment-card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading order details...</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>{statusDisplay.icon}</div>
              <h1 style={{ color: statusDisplay.color, marginBottom: '16px' }}>{statusDisplay.text}</h1>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>
                {statusDisplay.subtitle}
              </p>

              {verifying && (
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                  Verifying payment status...
                </p>
              )}

              {order && (
                <div className="payment-order-summary">
                  <h2>Order Details</h2>
                  <div className="order-details">
                    <p><strong>Order ID:</strong> #{order.id}</p>
                    {transactionId && (
                      <p><strong>Transaction ID:</strong> {transactionId}</p>
                    )}
                    <p><strong>Total Amount:</strong> {currencyUtils.formatPrice(order.totalAmount, 'primary')}</p>
                    <p><strong>Status:</strong> <span style={{ 
                      textTransform: 'capitalize',
                      color: order.status === 'paid' ? '#10b981' : order.status === 'failed' ? '#ef4444' : '#f59e0b',
                      fontWeight: '600'
                    }}>{order.status}</span></p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Link href="/books" className="btn-payment">
                  Continue Shopping
                </Link>
                {order?.status === 'failed' && orderId && (
                  <Link href={`/payment?orderId=${orderId}`} className="btn-cancel" style={{ color: '#f59e0b' }}>
                    Retry Payment
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

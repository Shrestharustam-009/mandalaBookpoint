'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { api } from '@/lib/api';
import siteConfig from '@/config/siteConfig';
import './payment.css';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderData = await api.orders.getById(orderId);
        setOrder(orderData);
      } catch (err) {
        setError('Failed to load order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    if (!order) {
      setError('Order information is missing');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await api.payment.generatePage({
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'NPR',
        customerInfo: {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone || '',
        },
        returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
        cancelUrl: `${window.location.origin}/payment/cancel?orderId=${order.id}`,
      });

      if (response.paymentPageUrl) {
        // Redirect to payment page
        window.location.href = response.paymentPageUrl;
      } else {
        setError('Failed to generate payment page');
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="payment-container">
          <div className="payment-loading">
            <p>Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="payment-container">
          <div className="payment-error">
            <h2>Order Not Found</h2>
            <p>The order you're looking for doesn't exist.</p>
            <button onClick={() => router.push('/')} className="btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="payment-container">
        <div className="payment-card">
          <h1>Complete Your Payment</h1>
          
          {error && (
            <div className="payment-error-message">
              {error}
            </div>
          )}

          <div className="payment-order-summary">
            <h2>Order Summary</h2>
            <div className="order-details">
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Total Amount:</strong> {order.totalAmount} {siteConfig.primaryCurrency}</p>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Payment Method</h2>
            <p>You will be redirected to a secure payment page to complete your transaction.</p>
          </div>

          <div className="payment-actions">
            <button
              onClick={handlePayment}
              disabled={processing}
              className="btn-payment"
            >
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="animate-spin" style={{ width: '18px', height: '18px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Proceed to Payment'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentPageContent />
    </Suspense>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import '../payment.css';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const orderId = searchParams.get('orderId');
  const orderNo = searchParams.get('orderNo');

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="payment-container">
        <div className="payment-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Payment Failed</h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              Your payment could not be processed. Please try again or use a different payment method.
            </p>

            {(orderId || orderNo) && (
              <div className="payment-order-summary">
                <h2>Details</h2>
                <div className="order-details">
                  {orderId && <p><strong>Order ID:</strong> #{orderId}</p>}
                  {orderNo && <p><strong>Reference:</strong> {orderNo}</p>}
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
              {orderId && (
                <Link href={`/payment?orderId=${orderId}`} className="btn-payment">
                  Retry Payment
                </Link>
              )}
              <Link href="/books" className="btn-cancel" style={{ color: '#6b7280' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}

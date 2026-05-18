'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import '../payment.css';

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const orderId = searchParams.get('orderId');

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="payment-container">
        <div className="payment-card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ color: '#ef4444', marginBottom: '16px' }}>Payment Cancelled</h1>
            <p style={{ color: '#6b7280', marginBottom: '32px' }}>
              Your payment was cancelled. No charges were made to your account.
            </p>

            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexDirection: 'column' }}>
              {orderId && (
                <Link href={`/payment?orderId=${orderId}`} className="btn-payment">
                  Try Again
                </Link>
              )}
              <Link href="/" className="btn-cancel">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCancelContent />
    </Suspense>
  );
}

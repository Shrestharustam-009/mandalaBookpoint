'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useAuth } from '@/app/auth-context';
import { useCart } from '@/app/cart-context';
import { api } from '@/lib/api';
import { currencyUtils, discountUtils } from '@/lib/configHelper';
import siteConfig from '@/config/siteConfig';
import './cart.css';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCart();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return customerInfo.name.trim() !== '' && 
           customerInfo.phone.trim() !== '' && 
           customerInfo.location !== '';
  };

  const getTotalWeight = () => {
    return cartItems.reduce((sum, item) => {
      const w = item.weight ?? 0;
      return sum + w * item.quantity;
    }, 0);
  };

  const calculateShipping = (location, totalWeight) => {
    let base = 0;

    switch (location) {
      case 'inside':          base = 1;    break;
      case 'outside':         base = 150;  break;
      case 'intl_europe_india': base = 1200; break;
      case 'intl_other':      base = 1500; break;
      case 'intl_canada_fast': base = 4500; break;
      default: return 0;
    }

    // Base rate covers the first 1 kg.
    // For every additional 1 kg above 1 kg, add 10% of the base rate.
    // e.g. 1 kg → base; 2 kg → base × 1.10; 3 kg → base × 1.20; etc.
    const weight = totalWeight > 0 ? totalWeight : 1;
    const extraKg = Math.max(0, weight - 1);          // kg above the first 1 kg
    const multiplier = 1 + 0.10 * extraKg;            // 10% per extra kg
    return Math.round(base * multiplier);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const hasInvalidItems = cartItems.some(item => item.price == null || item.price <= 0);
    if (hasInvalidItems) {
      setError('Some items in your cart are no longer available for purchase. Please remove them and try again.');
      return;
    }

    if (!isFormValid()) {
      setError('Please fill in all required fields (Name, Phone, and Location)');
      return;
    }

    const totalWeight = getTotalWeight();
    const shippingCost = calculateShipping(customerInfo.location, totalWeight);

    if (getCartTotal() + shippingCost <= 0) {
      setError('Your cart total is invalid. Please check your cart and try again.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const totalWeight = getTotalWeight();
      const shippingCost = calculateShipping(customerInfo.location, totalWeight);

      // Create order
      const orderData = {
        userId: user.id,
        customerName: customerInfo.name.trim(),
        customerEmail: customerInfo.email.trim() || user.email || '',
        customerPhone: customerInfo.phone.trim(),
        shippingAddress:
          customerInfo.location === 'inside'
            ? 'Inside Valley'
            : customerInfo.location === 'outside'
            ? 'Outside Valley'
            : customerInfo.location === 'intl_europe_india'
            ? 'International - Europe/India'
            : customerInfo.location === 'intl_canada_fast'
            ? 'International - Canada (fast)'
            : 'International - Other',
        totalAmount: getCartTotal() + shippingCost,
        status: 'pending',
        paymentMethod: 'paco',
        orderItems: cartItems.map(item => ({
          bookId: item.id,
          title: item.title,
          author: item.author,
          price: item.price,
          discount: item.discount,
          quantity: item.quantity,
        })),
      };

      const order = await api.orders.create(orderData);

      // Generate payment page
      const paymentResponse = await api.payment.generatePage({
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'NPR',
        customerInfo: {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone,
        },
        returnUrl: `${window.location.origin}/payment/success?orderId=${order.id}`,
        cancelUrl: `${window.location.origin}/payment/cancel?orderId=${order.id}`,
      });

      // Clear cart after successful order creation
      clearCart();

      // Redirect to payment page
      if (paymentResponse.paymentPageUrl) {
        window.location.href = paymentResponse.paymentPageUrl;
      } else {
        router.push(`/payment?orderId=${order.id}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateItemTotal = (item) => {
    const price = item.price ?? 0;
    if (price <= 0) return 0;
    const discountedPrice = item.discount > 0
      ? discountUtils.applyDiscount(price, item.discount)
      : price;
    return discountedPrice * item.quantity;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const totalWeight = getTotalWeight();
  const shipping = calculateShipping(customerInfo.location, totalWeight);
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <>
        <Header isAuthenticated={isAuthenticated} user={user} />
        <div className="cart-container">
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some books to get started!</p>
            <Link href="/books" className="btn-primary">
              Browse Books
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p className="cart-item-count">{getCartItemCount()} {getCartItemCount() === 1 ? 'item' : 'items'}</p>
        </div>

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => {
              const hasPrice = item.price != null && item.price > 0;
              const discountedPrice = hasPrice && item.discount > 0
                ? discountUtils.applyDiscount(item.price, item.discount)
                : item.price ?? 0;
              const itemTotal = calculateItemTotal(item);

              return (
                <div key={item.id} className="cart-item">
                  <Link href={`/books/${item.id}`} className="cart-item-image">
                    <Image
                      src={item.coverImage || "/placeholder.svg"}
                      alt={item.title}
                      width={120}
                      height={180}
                    />
                  </Link>

                  <div className="cart-item-details">
                    <Link href={`/books/${item.id}`}>
                      <h3 className="cart-item-title">{item.title}</h3>
                      <p className="cart-item-author">by {item.author}</p>
                    </Link>

                    <div className="cart-item-price">
                      {hasPrice ? (
                        item.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {currencyUtils.formatPrice(item.price, 'primary')}
                            </span>
                            <span className="discounted-price">
                              {currencyUtils.formatPrice(discountedPrice, 'primary')}
                            </span>
                          </>
                        ) : (
                          <span className="price">
                            {currencyUtils.formatPrice(item.price, 'primary')}
                          </span>
                        )
                      ) : (
                        <span className="price" style={{ color: '#ef4444' }}>No longer available</span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-quantity">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="qty-input"
                        min="1"
                        max={item.stock ?? 999}
                      />
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.stock != null && item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <span className="item-total-price">
                      {hasPrice ? currencyUtils.formatPrice(itemTotal, 'primary') : '-'}
                    </span>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Customer Information</h2>
              
              <div className="checkout-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email <span className="optional">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Location <span className="required">*</span>
                  </label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value="inside"
                        checked={customerInfo.location === 'inside'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Inside Valley (Rs. 1 for 1 kg)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value="outside"
                        checked={customerInfo.location === 'outside'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Outside Valley (Rs. 150 for 1 kg,)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value="intl_europe_india"
                        checked={customerInfo.location === 'intl_europe_india'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>International - Europe / India (Rs. 1200 for 1 kg)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value="intl_other"
                        checked={customerInfo.location === 'intl_other'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>International - Other (Rs. 1500 for 1 kg)</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="location"
                        value="intl_canada_fast"
                        checked={customerInfo.location === 'intl_canada_fast'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>International - Canada (Rs. 4500 for 1 kg, 7–14 days)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="summary-divider"></div>

              <h2 style={{ marginTop: '24px', marginBottom: '20px' }}>Order Summary</h2>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{currencyUtils.formatPrice(subtotal, 'primary')}</span>
              </div>

              <div className="summary-row">
                <span>Delivery ({totalWeight.toFixed(2)} kg):</span>
                <span>{currencyUtils.formatPrice(shipping, 'primary')}</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>{currencyUtils.formatPrice(total, 'primary')}</span>
              </div>

              <button
                className="btn-checkout"
                onClick={handleCheckout}
                disabled={processing || !isFormValid() || total <= 0 || cartItems.some(i => i.price == null || i.price <= 0)}
              >
                {processing ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <Link href="/books" className="btn-continue-shopping">
                Continue Shopping
              </Link>

              <button
                className="btn-clear-cart"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

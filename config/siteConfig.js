/**
 * Central site configuration file
 * Update values here to reflect across the entire website
 */

const siteConfig = {
  // Site Identity
  siteName: 'MandalaBookPoint',
  siteDescription: 'Your digital library for discovering and purchasing books',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  
  // Logo & Branding
  logo: '/placeholder-logo.svg',
  logoAlt: 'MandalaBookPoint Logo',
  
  // Theme Colors
  primaryColor: '#10b981', // Emerald green
  accentColor: '#059669',  // Darker emerald
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  
  // Currency Settings
  primaryCurrency: 'NRs',
  primaryCurrencySymbol: 'Rs.',
  secondaryCurrency: 'USD',
  secondaryCurrencySymbol: '$',
  exchangeRate: 132, // 1 USD = 132 NRs (update as needed)
  
  // Contact Information
  email: 'books@mos.com.np, info@mandalabookpoint.com',
  phone: '00977-1-5349555, 5355921',
  address: 'Kantipath, G.P.O Box 528, Kathmandu, Nepal',
  website: 'www.mandalabookpoint.com',
  
  // Social Media
  socialLinks: {
    twitter: 'https://twitter.com/mandalabookpoint',
    instagram: 'https://instagram.com/mandalabookpoint',
    facebook: 'https://facebook.com/mandalabookpoint',
    youtube: 'https://youtube.com/mandalabookpoint',
  },
  
  // Payment Methods
  paymentMethods: {
    paco: {
      enabled: true,
      name: 'PACO (2C2P)',
      description: 'Secure payment gateway',
    },
    bankTransfer: {
      enabled: true,
      name: 'Bank Transfer',
    },
  },
  
  // Pagination
  booksPerPage: 12,
  
  // Bulk Discount Rules
  bulkDiscounts: [
    { quantity: 5, discountPercent: 5 },
    { quantity: 10, discountPercent: 10 },
    { quantity: 20, discountPercent: 15 },
  ],
  
  // Newsletter
  newsletterEnabled: true,
  
  // Admin
  adminPath: '/admin',
};

export default siteConfig;

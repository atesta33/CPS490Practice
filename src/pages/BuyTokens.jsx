import { useState } from 'react';
import { Header } from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Wallet } from '../components/Wallet.jsx';
import styles from './BuyTokens.module.css';

const tokenPackages = [
  { id: 1, tokens: 100, price: 9.99, popular: false },
  { id: 2, tokens: 500, price: 39.99, popular: true, bonus: 50 },
  { id: 3, tokens: 1000, price: 69.99, popular: false, bonus: 150 },
  { id: 4, tokens: 5000, price: 299.99, popular: false, bonus: 1000 },
];

export function BuyTokens() {
  const [token] = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedPackage(null);
    }, 3000);
  };

  if (!token) {
    return (
      <div className={styles.buyTokensPage}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loginPrompt}>
            <h2>Please Log In</h2>
            <p>You need to be logged in to purchase tokens.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.buyTokensPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Buy Tokens</h1>
          <p className={styles.subtitle}>
            Purchase tokens to bid on auctions and win amazing products
          </p>
          <div className={styles.currentBalance}>
            <Wallet />
          </div>
        </div>

        {showSuccess && (
          <div className={styles.successBanner}>
            <span className={styles.successIcon}>✓</span>
            <div>
              <strong>Purchase Successful!</strong>
              <p>
                You received {selectedPackage.tokens}
                {selectedPackage.bonus ? ` + ${selectedPackage.bonus} bonus` : ''} tokens
              </p>
            </div>
          </div>
        )}

        <div className={styles.packagesGrid}>
          {tokenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`${styles.packageCard} ${pkg.popular ? styles.popular : ''}`}
            >
              {pkg.popular && <div className={styles.popularBadge}>Most Popular</div>}

              <div className={styles.packageHeader}>
                <div className={styles.tokenAmount}>
                  <span className={styles.tokenIcon}>🪙</span>
                  <span className={styles.tokenCount}>{pkg.tokens.toLocaleString()}</span>
                </div>
                {pkg.bonus && (
                  <div className={styles.bonus}>+ {pkg.bonus} Bonus!</div>
                )}
              </div>

              <div className={styles.packagePrice}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>{pkg.price}</span>
              </div>

              <button
                onClick={() => handlePurchase(pkg)}
                className={styles.purchaseButton}
              >
                Purchase Now
              </button>

              <div className={styles.packageFeatures}>
                <div className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  <span>Instant delivery</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  <span>Secure payment</span>
                </div>
                <div className={styles.feature}>
                  <span className={styles.checkmark}>✓</span>
                  <span>Never expires</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.infoSection}>
          <h2 className={styles.infoTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Choose Package</h3>
              <p>Select a token package that suits your bidding needs</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Complete Payment</h3>
              <p>Securely purchase tokens with your preferred payment method</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Start Bidding</h3>
              <p>Use your tokens to bid on exciting auctions and win products</p>
            </div>
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>Do tokens expire?</h3>
              <p>No, your tokens never expire. Use them whenever you want!</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Can I get a refund?</h3>
              <p>Tokens can be refunded within 24 hours if unused. Contact support for assistance.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>What happens if I lose a bid?</h3>
              <p>Your tokens are automatically refunded if you are outbid by another user.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Are there discounts for bulk purchases?</h3>
              <p>Yes! Larger packages come with bonus tokens to maximize your value.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

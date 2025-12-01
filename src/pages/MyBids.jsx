import { Header } from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import styles from './MyBids.module.css';

export function MyBids() {
  const [token] = useAuth();

  if (!token) {
    return (
      <div className={styles.myBidsPage}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loginPrompt}>
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your bids.</p>
            <Link to="/login" className={styles.loginLink}>Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myBidsPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Bids</h1>
          <p className={styles.pageSubtitle}>
            Track your active bids and auction participation
          </p>
        </div>

        <div className={styles.comingSoon}>
          <div className={styles.iconContainer}>
            <span className={styles.icon}>🔨</span>
          </div>
          <h3>Coming Soon</h3>
          <p>
            This feature is under development. Soon you'll be able to track all
            your bids in one place!
          </p>
          <Link to="/" className={styles.browseButton}>
            Browse Auctions
          </Link>
        </div>
      </div>
    </div>
  );
}

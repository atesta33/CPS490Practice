import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { getPosts } from '../api/posts.js';
import { PostList } from '../components/PostList';
import { Header } from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import styles from './MyBids.module.css';

export function MyBids() {
  const [token] = useAuth();

  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.sub;
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  const postsQuery = useQuery({
    queryKey: ['posts', { bidder: userId }],
    queryFn: () => getPosts({ bidder: userId }),
    enabled: !!userId,
  });

  const posts = postsQuery.data ?? [];

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

        {postsQuery.isLoading && (
          <div className={styles.loading}>Loading your bids...</div>
        )}

        {postsQuery.isError && (
          <div className={styles.error}>
            Error loading bids. Please try again.
          </div>
        )}

        {!postsQuery.isLoading && !postsQuery.isError && (
          <>
            {posts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.iconContainer}>
                  <span className={styles.icon}>🔨</span>
                </div>
                <h3>No bids yet</h3>
                <p>Start bidding on auctions to see them here!</p>
                <Link to="/" className={styles.browseButton}>
                  Browse Auctions
                </Link>
              </div>
            ) : (
              <PostList posts={posts} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

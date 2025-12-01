import { useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { getPosts } from '../api/posts.js';
import { PostList } from '../components/PostList';
import { Header } from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import styles from './MyListings.module.css';

export function MyListings() {
  const [token] = useAuth();

  let username = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.username;
    } catch (e) {
      console.error('Error decoding token:', e);
    }
  }

  const postsQuery = useQuery({
    queryKey: ['posts', { author: username }],
    queryFn: () => getPosts({ author: username }),
    enabled: !!username,
  });

  const posts = postsQuery.data ?? [];

  if (!token) {
    return (
      <div className={styles.myListingsPage}>
        <Header />
        <div className={styles.container}>
          <div className={styles.loginPrompt}>
            <h2>Please Log In</h2>
            <p>You need to be logged in to view your listings.</p>
            <Link to="/login" className={styles.loginLink}>Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.myListingsPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Listings</h1>
          <p className={styles.pageSubtitle}>
            Manage your active and closed auction listings
          </p>
        </div>

        {postsQuery.isLoading && (
          <div className={styles.loading}>Loading your listings...</div>
        )}

        {postsQuery.isError && (
          <div className={styles.error}>
            Error loading listings. Please try again.
          </div>
        )}

        {!postsQuery.isLoading && !postsQuery.isError && (
          <>
            {posts.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No listings yet</h3>
                <p>Create your first listing to start selling!</p>
                <Link to="/" className={styles.createButton}>
                  Create Listing
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

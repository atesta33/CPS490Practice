import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Post.module.css";
import { User } from "./User.jsx";

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    const end = new Date(endTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = end - now;
      setTimeLeft(diff > 0 ? diff : 0);
    };

    update();
    const intervalId = setInterval(update, 1000);

    return () => clearInterval(intervalId);
  }, [endTime]);

  if (timeLeft === null) {
    return <span className={styles.noEndTime}>No end time</span>;
  }

  if (timeLeft === 0) {
    return <span className={styles.ended}>Auction Ended</span>;
  }

  const totalSeconds = Math.floor(timeLeft / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return <span>{days}d {hours}h</span>;
  }
  if (hours > 0) {
    return <span>{hours}h {minutes}m</span>;
  }
  return <span>{minutes}m {seconds}s</span>;
}

export function Post({ id, title, contents, author, currentPrice, startingPrice, status, bids, endTime }) {
  const bidCount = bids?.length || 0;
  const isOpen = status === "OPEN";

  return (
    <article className={`${styles.productCard} ${!isOpen ? styles.closed : ''}`}>
      <div className={styles.imageContainer}>
        <div className={styles.placeholderImage}>
          <span className={styles.imageIcon}>📦</span>
        </div>
        {!isOpen && <div className={styles.closedOverlay}>CLOSED</div>}
      </div>

      <div className={styles.cardContent}>
        <div className={styles.statusBadge} data-status={status}>
          {status}
        </div>

        <h3 className={styles.productTitle}>{title}</h3>
        <p className={styles.productDescription}>
          {contents && contents.length > 120
            ? `${contents.substring(0, 120)}...`
            : contents}
        </p>

        <div className={styles.auctionInfo}>
          <div className={styles.priceSection}>
            <div className={styles.currentPrice}>
              <span className={styles.priceLabel}>Current Bid</span>
              <span className={styles.priceAmount}>
                <span className={styles.tokenIcon}>🪙</span>
                {currentPrice ?? startingPrice ?? 0}
              </span>
            </div>
            {startingPrice && (
              <div className={styles.startingPrice}>
                Starting: {startingPrice} tokens
              </div>
            )}
          </div>

          <div className={styles.auctionMeta}>
            <div className={styles.bidCount}>
              <span className={styles.metaIcon}>🔨</span>
              <span>{bidCount} {bidCount === 1 ? 'bid' : 'bids'}</span>
            </div>
            <div className={styles.timeLeft}>
              <span className={styles.metaIcon}>⏰</span>
              <CountdownTimer endTime={endTime} />
            </div>
          </div>
        </div>

        {author && (
          <div className={styles.sellerInfo}>
            <span className={styles.sellerLabel}>Seller:</span>
            <User id={author} />
          </div>
        )}

        <div className={styles.actions}>
          <Link to={`/posts/${id}`} className={styles.bidButton}>
            {isOpen ? 'Place Bid' : 'View Details'}
          </Link>
          {author && (
            <Link to={`/dm/${author}`} className={styles.messageButton}>
              Message
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

Post.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
  currentPrice: PropTypes.number,
  startingPrice: PropTypes.number,
  status: PropTypes.string,
  bids: PropTypes.array,
  endTime: PropTypes.string,
};

CountdownTimer.propTypes = {
  endTime: PropTypes.string,
};

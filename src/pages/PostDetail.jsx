import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, placeBid } from "../api/posts.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { User } from "../components/User.jsx";
import { Header } from "../components/Header.jsx";
import { Wallet } from "../components/Wallet.jsx";
import styles from "./PostDetail.module.css";

function formatDuration(ms) {
  if (ms == null) return "";
  if (ms <= 0) return "Auction ended";

  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function PostDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [token] = useAuth() || {};
  const isLoggedIn = Boolean(token);
  const [amount, setAmount] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
  });

  const bidMutation = useMutation({
    mutationFn: () => placeBid(token, id, Number(amount)),
    onSuccess: () => {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    bidMutation.mutate();
  };

  useEffect(() => {
    if (!post?.endTime) {
      setTimeLeft(null);
      return;
    }

    const end = new Date(post.endTime).getTime();

    const update = () => {
      const now = Date.now();
      const diff = end - now;
      setTimeLeft(diff > 0 ? diff : 0);
    };

    update();
    const intervalId = setInterval(update, 1000);

    return () => clearInterval(intervalId);
  }, [post?.endTime]);

  if (isLoading) {
    return (
      <div className={styles.detailPage}>
        <Header />
        <div className={styles.loading}>Loading auction details...</div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className={styles.detailPage}>
        <Header />
        <div className={styles.container}>
          <div className={styles.error}>
            <div>
              <p>Error loading listing.</p>
              <p>{error?.message}</p>
              <Link to="/">Back to marketplace</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    contents,
    author,
    currentPrice,
    startingPrice,
    status,
    startTime,
    endTime,
    bids = [],
  } = post;

  const isOpen = status === "OPEN";
  const minBid = (currentPrice ?? startingPrice ?? 0) + 1;

  return (
    <div className={styles.detailPage}>
      <Header />
      <div className={styles.container}>
        <Link to="/" className={styles.backLink}>
          ← Back to Marketplace
        </Link>

        <div className={styles.content}>
          <div className={styles.mainSection}>
            <div className={styles.imageSection}>
              <div className={styles.placeholderImage}>📦</div>
            </div>

            <div className={styles.infoCard}>
              <div className={`${styles.statusBadge} ${isOpen ? styles.open : styles.closed}`}>
                {status}
              </div>

              <h1 className={styles.title}>{title}</h1>

              <p className={styles.description}>
                {contents || "No description provided."}
              </p>

              {author && (
                <div className={styles.sellerSection}>
                  <span className={styles.sellerLabel}>Seller:</span>
                  <User id={author} />
                  <Link to={`/dm/${author}`} className={styles.messageSellerBtn}>
                    Message Seller
                  </Link>
                </div>
              )}
            </div>

            <div className={styles.bidHistory}>
              <h2 className={styles.bidHistoryTitle}>
                Bid History ({bids.length})
              </h2>

              {bids.length === 0 ? (
                <div className={styles.noBids}>No bids yet. Be the first!</div>
              ) : (
                <div className={styles.bidList}>
                  {bids
                    .slice()
                    .reverse()
                    .map((bid, index) => (
                      <div key={index} className={styles.bidItem}>
                        <div className={styles.bidItemLeft}>
                          <div className={styles.bidAmount}>
                            <span className={styles.tokenIcon}>🪙</span>
                            {bid.amount}
                          </div>
                          <div>
                            <div className={styles.bidder}>
                              <User id={bid.bidder} />
                            </div>
                            {bid.createdAt && (
                              <div className={styles.bidTime}>
                                {new Date(bid.createdAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.bidCard}>
              <div className={styles.priceSection}>
                <div className={styles.currentPriceLabel}>Current Bid</div>
                <div className={styles.currentPrice}>
                  <span className={styles.tokenIcon}>🪙</span>
                  {currentPrice ?? startingPrice ?? 0}
                </div>
                {startingPrice && (
                  <div className={styles.startingPrice}>
                    Starting bid: {startingPrice} tokens
                  </div>
                )}
              </div>

              <div className={styles.auctionMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Bids</span>
                  <span className={styles.metaValue}>{bids.length}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Time Left</span>
                  <span className={`${styles.metaValue} ${styles.countdown}`}>
                    {formatDuration(timeLeft) || "No limit"}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Status</span>
                  <span className={styles.metaValue}>{status}</span>
                </div>
                {startTime && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Started</span>
                    <span className={styles.metaValue}>
                      {new Date(startTime).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {!isLoggedIn && (
                <div className={styles.loginPrompt}>
                  <p>Please log in to place a bid</p>
                </div>
              )}

              {isLoggedIn && !isOpen && (
                <div className={styles.closedMessage}>
                  <p>This auction is closed</p>
                </div>
              )}

              {isLoggedIn && isOpen && (
                <form onSubmit={handleSubmit} className={styles.bidForm}>
                  <div className={styles.bidInputGroup}>
                    <label htmlFor="bid-amount" className={styles.bidLabel}>
                      Your Bid (min: {minBid} tokens)
                    </label>
                    <input
                      id="bid-amount"
                      type="number"
                      value={amount}
                      min={minBid}
                      onChange={(e) => setAmount(e.target.value)}
                      className={styles.bidInput}
                      placeholder={`${minBid} or more`}
                      disabled={bidMutation.isPending}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!amount || bidMutation.isPending}
                    className={styles.bidButton}
                  >
                    {bidMutation.isPending ? "Placing Bid..." : "Place Bid"}
                  </button>

                  {isLoggedIn && <Wallet />}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

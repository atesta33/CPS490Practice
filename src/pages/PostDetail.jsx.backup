import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getPostById, placeBid } from "../api/posts.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { User } from "../components/User.jsx";

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

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
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
      queryClient.invalidateQueries({ queryKey: ["me"] });
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

  if (isLoading) {
    return <div>Loading listing...</div>;
  }

  if (isError || !post) {
    return (
      <div>
        <p>Error loading listing.</p>
        <p>{error?.message}</p>
        <Link to="/">Back to listings</Link>
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

  return (
    <div>
      <h1>{title}</h1>

      <p>{contents}</p>

      <h2>Seller</h2>
      <User id={author} />

      <h2>Auction Info</h2>
      <p>Starting price: {startingPrice ?? 0} tokens</p>
      <p>Current price: {currentPrice ?? 0} tokens</p>
      <p>Status: {status}</p>
      <p>
        Start time: {startTime ? new Date(startTime).toLocaleString() : "Now"}
      </p>
      <p>
        End time:{" "}
        {endTime ? new Date(endTime).toLocaleString() : "No end time set"}
      </p>
      {endTime && <p>Time remaining: {formatDuration(timeLeft)}</p>}

      <h2>Place a Bid</h2>

      {!isLoggedIn && <p>You must log in to place a bid.</p>}

      {isLoggedIn && status === "OPEN" && (
        <form onSubmit={handleSubmit}>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              min={(currentPrice ?? startingPrice ?? 0) + 1}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button type="submit" disabled={bidMutation.isPending}>
            {bidMutation.isPending ? "Placing..." : "Submit Bid"}
          </button>
        </form>
      )}

      {isLoggedIn && status !== "OPEN" && <p>This auction is closed.</p>}

      <h2>Bid History</h2>
      {bids.length === 0 ? (
        <p>No bids yet.</p>
      ) : (
        <ul>
          {bids
            .slice()
            .reverse()
            .map((bid, index) => (
              <li key={index}>
                {bid.amount} tokens — by <User id={bid.bidder} /> on{" "}
                {new Date(bid.createdAt).toLocaleString()}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

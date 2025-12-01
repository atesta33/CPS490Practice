import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUserInfo } from "../api/users.js";
import styles from "./Wallet.module.css";

export function Wallet() {
  const { token, userId } = useAuth() || {};

  if (!token || !userId) return null;

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserInfo(userId),
  });

  if (isLoading) {
    return (
      <div className={styles.wallet}>
        <span className={styles.label}>Tokens:</span>
        <span className={styles.amount}>...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className={styles.wallet}>
        <span className={styles.label}>Tokens:</span>
        <span className={styles.amount}>--</span>
      </div>
    );
  }

  const tokenCount = user.tokens ?? 0;

  return (
    <div className={styles.wallet}>
      <span className={styles.icon}>🪙</span>
      <div className={styles.content}>
        <span className={styles.label}>Your Balance</span>
        <span className={styles.amount}>{tokenCount} Tokens</span>
      </div>
    </div>
  );
}

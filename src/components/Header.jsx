import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { useAuth } from "../contexts/AuthContext"
import { User } from "./User.jsx"
import { Wallet } from "./Wallet.jsx"
import styles from './Header.module.css'

export function Header() {
    const [token, setToken] = useAuth()

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <Link to="/" className={styles.brand}>
                    <span className={styles.brandIcon}>🏪</span>
                    <span>TACBAY</span>
                </Link>
                <nav className={styles.nav}>

                    {token ? (
                        <div className={styles.userInfo}>
                            <Wallet />

                            <div className={styles.userDetails}>
                                <span className={styles.loggedInText}>
                                    <User id={jwtDecode(token).sub} />
                                </span>
                            </div>

                            <div className={styles.authLinks}>
                                <Link to="/my-listings" className={styles.navLink}>My Listings</Link>
                                <Link to="/my-bids" className={styles.navLink}>My Bids</Link>
                                <Link to="/buy-tokens" className={styles.buyTokensBtn}>Buy Tokens</Link>
                                <Link to="/inbox" className={styles.navLink}>Inbox</Link>
                                <Link to="/settings" className={styles.navLink}>Settings</Link>
                                <button
                                    onClick={() => setToken(null)}
                                    className={styles.logoutButton}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.authLinks}>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                            <Link to="/signup" className={styles.navLink}>Sign Up</Link>
                            <Link to="/inbox" className={styles.navLink}>Inbox</Link>
                        </div>
                    )}

                </nav>
            </div>
        </header>
    )
}

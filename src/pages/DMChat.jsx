import { useParams, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { jwtDecode } from "jwt-decode"
import { useDMChat } from "../hooks/useDMChat"
import { useAuth } from "../contexts/AuthContext.jsx"
import { Header } from "../components/Header.jsx"
import { User } from "../components/User.jsx"
import styles from "./DMChat.module.css"

export default function DMChat() {
  const { userId } = useParams()
  const { messages, send } = useDMChat(userId)
  const [text, setText] = useState("")
  const messagesEndRef = useRef(null)
  const [token] = useAuth() || []

  let currentUserId
  try {
    if (token) {
      const decoded = jwtDecode(token)
      currentUserId = decoded.sub
    }
  } catch (e) {
    console.error("Failed to decode token", e)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      send(text)
      setText("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className={styles.chatPage}>
      <Header />
      <div className={styles.container}>
        <div className={styles.chatHeader}>
          <Link to="/inbox" className={styles.backButton}>
            ← Back to Inbox
          </Link>
          <div className={styles.chatWith}>
            <span className={styles.chatWithLabel}>Chat with</span>
            <User id={userId} />
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>💬</div>
              <p>No messages yet</p>
              <p className={styles.emptySubtext}>Start the conversation!</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((m) => {
                const isOwnMessage = m.from === currentUserId
                return (
                  <div
                    key={m._id}
                    className={`${styles.messageWrapper} ${isOwnMessage ? styles.ownMessage : styles.theirMessage}`}
                  >
                    <div className={styles.messageBubble}>
                      <div className={styles.messageText}>{m.text}</div>
                      {m.createdAt && (
                        <div className={styles.messageTime}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.inputContainer}>
          <input
            type="text"
            className={styles.messageInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            autoFocus
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!text.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

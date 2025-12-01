import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createPost } from "../api/posts.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import styles from "./CreatePost.module.css";

export function CreatePost() {
  const [token] = useAuth();
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const queryClient = useQueryClient();
  const createPostMutation = useMutation({
    mutationFn: () =>
      createPost(token, { title, contents, startingPrice, startTime, endTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setTitle("");
      setContents("");
      setStartingPrice("");
      setStartTime("");
      setEndTime("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate({});
  };

  if (!token) {
    return (
      <div className={styles.loginPrompt}>
        Please log in to create a listing.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.createForm}>
      <div className={styles.formGroup}>
        <label htmlFor="create-title" className={styles.label}>
          Product Title
        </label>
        <input
          type="text"
          name="create-title"
          id="create-title"
          placeholder="e.g., Vintage Camera, Designer Watch..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.titleInput}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="create-contents" className={styles.label}>
          Product Description
        </label>
        <textarea
          id="create-contents"
          placeholder="Describe your item in detail..."
          value={contents}
          onChange={(e) => setContents(e.target.value)}
          className={styles.contentTextarea}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="create-startingPrice" className={styles.label}>
            Starting Bid (Tokens)
          </label>
          <input
            type="number"
            id="create-startingPrice"
            placeholder="e.g., 10"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            className={styles.titleInput}
            min="1"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="create-startTime" className={styles.label}>
            Auction Start (optional)
          </label>
          <input
            type="datetime-local"
            id="create-startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={styles.titleInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="create-endTime" className={styles.label}>
            Auction End (optional)
          </label>
          <input
            type="datetime-local"
            id="create-endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={styles.titleInput}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!title || createPostMutation.isPending}
        className={styles.submitButton}
      >
        {createPostMutation.isPending ? "Creating..." : "Create Listing"}
      </button>

      {createPostMutation.isSuccess && (
        <div className={styles.successMessage}>
          ✓ Listing created successfully!
        </div>
      )}
    </form>
  );
}

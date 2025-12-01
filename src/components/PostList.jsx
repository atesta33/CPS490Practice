import PropTypes from "prop-types";
import { Post } from "./Post.jsx";
import styles from "./PostList.module.css";

export function PostList({ posts = [] }) {
  if (posts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No listings yet</h3>
        <p>Be the first to create a listing!</p>
      </div>
    );
  }

  return (
    <div className={styles.postGrid}>
      {posts.map((post) => (
        <Post
          key={post._id}
          id={post._id}
          title={post.title}
          contents={post.contents}
          author={
            typeof post.author === "string" ? post.author : post.author?._id
          }
          currentPrice={post.currentPrice}
          startingPrice={post.startingPrice}
          status={post.status}
          bids={post.bids}
          endTime={post.endTime}
        />
      ))}
    </div>
  );
}

PostList.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      contents: PropTypes.string,
      author: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          _id: PropTypes.string,
        }),
      ]),
      currentPrice: PropTypes.number,
      status: PropTypes.string,
      tags: PropTypes.arrayOf(PropTypes.string),
    }),
  ).isRequired,
};

import {
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  listPostsByBidder,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  placeBidOnPost,
} from "../services/posts.js";

import { requireAuth } from "../middleware/jwt.js";

export function postsRoutes(app) {
  app.get("/api/v1/posts", async (req, res) => {
    const { sortBy, sortOrder, author, tag, bidder } = req.query;
    const options = { sortBy, sortOrder };
    try {
      if ((author && tag) || (author && bidder) || (tag && bidder)) {
        return res.status(400).json("Please filter by only one parameter: author, tag, or bidder");
      } else if (author) {
        return res.json(await listPostsByAuthor(author, options));
      } else if (tag) {
        return res.json(await listPostsByTag(tag, options));
      } else if (bidder) {
        return res.json(await listPostsByBidder(bidder, options));
      } else {
        return res.json(await listAllPosts(options));
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).end();
    }
  });

  app.get("/api/v1/posts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const post = await getPostById(id);
      if (post == null) return res.status(404).end();
      return res.json(post);
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      return res.status(500).end();
    }
  });
  app.post("/api/v1/posts/", requireAuth, async (req, res) => {
    try {
      const post = await createPost(req.auth.sub, req.body);
      return res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).end();
    }
  });
  app.patch("/api/v1/posts/:id", requireAuth, async (req, res) => {
    try {
      const post = await updatePost(req.auth.sub, req.params.id, req.body);
      return res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).end();
    }
  });
  app.delete("/api/v1/posts/:id", requireAuth, async (req, res) => {
    try {
      const { deletedCount } = await deletePost(req.auth.sub, req.params.id);
      if (deletedCount === 0) return res.status(404).end();
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).end();
    }
  });
  app.post("/api/v1/posts/:id/bid", requireAuth, async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
      const post = await placeBidOnPost(req.auth.sub, id, amount);
      return res.json(post);
    } catch (error) {
      console.error("Error placing bid on post:", error);
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).end();
    }
  });
}

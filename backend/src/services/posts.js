import { Post } from "../db/models/post.js";
import { User } from "../db/models/user.js";

export async function createPost(userId, data) {
  const { title, contents, tags, startingPrice, startTime, endTime } = data;

  const basePrice = Number.isFinite(Number(startingPrice))
    ? Number(startingPrice)
    : 1;

  let start = startTime ? new Date(startTime) : new Date();
  let end = endTime ? new Date(endTime) : undefined;

  if (end && end <= start) {
    const error = new Error("End time must be after start time");
    error.status = 400;
    throw error;
  }

  const post = await Post.create({
    title,
    contents,
    tags,
    author: userId,
    startingPrice: basePrice,
    currentPrice: basePrice,
    bids: [],
    status: "OPEN",
    startTime: start,
    endTime: end,
  });

  return post;
}

async function listPosts(
  query = {},
  { sortBy = "createdAt", sortOrder = "descending" } = {},
) {
  const dir = sortOrder === "ascending" ? 1 : -1;

  if (sortBy === "descriptionLength") {
    return await Post.aggregate([
      { $match: query },
      {
        $addFields: {
          descriptionLength: {
            $strLenCP: { $ifNull: ["$contents", ""] },
          },
        },
      },
      { $sort: { descriptionLength: dir, updatedAt: -1, _id: 1 } },
    ]);
  }

  const q = Post.find(query).sort({ [sortBy]: dir });
  if (sortBy === "title") {
    q.collation({ locale: "en", strength: 2, numericOrdering: true });
  }
  return await q;
}

export async function listAllPosts(options) {
  return await listPosts({}, options);
}

export async function listPostsByAuthor(authorUsername, options) {
  const user = await User.findOne({ username: authorUsername });
  if (!user) return [];
  return await listPosts({ author: user._id }, options);
}

export async function listPostsByTag(tags, options) {
  return await listPosts({ tags }, options);
}

export async function getPostById(postID) {
  return await Post.findById(postID);
}

export async function updatePost(userID, postID, { title, contents, tags }) {
  return await Post.findByIdAndUpdate(
    { _id: postID, author: userID },
    { $set: { title, contents, tags } },
    { new: true },
  );
}

export async function deletePost(userID, postID) {
  return await Post.deleteOne({ _id: postID, author: userID });
}

export async function placeBidOnPost(userId, postId, rawAmount) {
  const amount = Number(rawAmount);

  // basic validation
  if (!Number.isFinite(amount) || amount <= 0) {
    const error = new Error("Invalid bid amount");
    error.status = 400;
    throw error;
  }

  // find the post
  const post = await Post.findById(postId);
  if (!post) {
    const error = new Error("Post not found");
    error.status = 404;
    throw error;
  }

  // make sure auction is open
  if (post.status !== "OPEN") {
    const error = new Error("Auction is not open");
    error.status = 400;
    throw error;
  }

  // check auction time constraints
  const now = new Date();

  if (post.startTime && now < post.startTime) {
    const error = new Error("Auction has not started yet");
    error.status = 400;
    throw error;
  }

  if (post.endTime && now > post.endTime) {
    post.status = "CLOSED";
    await post.save();

    const error = new Error("Auction has ended");
    error.status = 400;
    throw error;
  }

  // bid must beat currentPrice
  if (amount <= post.currentPrice) {
    const error = new Error("Bid must be higher than current price");
    error.status = 400;
    throw error;
  }

  // get bidding user
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  // ensure user has tokens field (for legacy users)
  if (user.tokens === undefined || user.tokens === null) {
    user.tokens = 100;
    await user.save();
  }

  // check tokens
  if (user.tokens < amount) {
    const error = new Error(`Not enough tokens. You have ${user.tokens}, need ${amount}`);
    error.status = 400;
    throw error;
  }

  // refund previous highest bidder (if any)
  const previousHighest = post.bids[post.bids.length - 1];
  if (previousHighest) {
    const prevUser = await User.findById(previousHighest.bidder);
    if (prevUser) {
      prevUser.tokens += previousHighest.amount;
      await prevUser.save();
    }
  }

  // deduct tokens from current bidder
  user.tokens -= amount;
  await user.save();

  // record new bid on the post
  post.bids.push({
    bidder: user._id,
    amount,
  });
  post.currentPrice = amount;

  await post.save();

  //populate some references for nicer frontend data
  const updatedPost = await Post.findById(post._id)
    .populate("author", "username")
    .populate("bids.bidder", "username")
    .lean();

  return updatedPost;
}

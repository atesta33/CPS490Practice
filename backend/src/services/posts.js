import { Post } from '../db/models/post.js'
import { User } from '../db/models/user.js'

export async function createPost(userId, {title, contents, tags}) {
    console.log('inside services createPost')
    const post = new Post({title, author: userId, contents, tags})
    return await post.save()
}


async function listPosts(
  query = {},
  { sortBy = 'createdAt', sortOrder = 'descending' } = {}
) {
  const dir = sortOrder === 'ascending' ? 1 : -1; // asending or descending?

  if (sortBy === 'descriptionLength') {
    return await Post.aggregate([
      { $match: query },
      {
        $addFields: {
          descriptionLength: {
            $strLenCP: { $ifNull: ['$contents', ''] }
          }
        }
      },
      { $sort: { descriptionLength: dir, updatedAt: -1, _id: 1 } }
    ]);
  }

  const q = Post.find(query).sort({ [sortBy]: dir });
  if (sortBy === 'title') {
    q.collation({ locale: 'en', strength: 2, numericOrdering: true });
  }
  return await q;
}

// helper listallposts for listposts sort by desc
export async function listAllPosts(options) {
  return await listPosts({}, options);
}

export async function listPostsByAuthor(authorUsername, options) {
    const user = await User.findOne({username: authorUsername})
    if (!user) return []
    return await listPosts({author: user._id}, options)
}

export async function listPostsByTag(tags, options){
    return await listPosts({tags}, options)
}

export async function getPostById(postID) {
    return await Post.findById(postID)
}

export async function updatePost(userID, postID, {title, contents, tags}) {
    return await Post.findByIdAndUpdate(
        {_id: postID, author: userID},
        {$set: {title, contents, tags}},
        {new: true},
    )
}

export async function deletePost(userID, postID) {
    return await Post.deleteOne({_id: postID, author: userID})
}
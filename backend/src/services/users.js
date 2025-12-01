import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {User} from '../db/models/user.js'
import {Post} from '../db/models/post.js'


export async function updateUser(userID, { currentPassword, newUsername, newPassword }) {
    const user = await User.findById(userID)
    if (!user) return null

    const ok = await bcrypt.compare(currentPassword ?? '', user.password)
    if (!ok) return null

    const update = {}
    if (newUsername) update.username = newUsername
    if (newPassword) update.password = await bcrypt.hash(newPassword, 10)

    return await User.findByIdAndUpdate(
        userID,
        { $set: update },
        { new: true },
    )
}

export async function deleteUser(userID) {
  await Post.deleteMany({ author: userID })

  return await User.deleteOne({ _id: userID })
}


export async function loginUser({username, password}) {
    const user = await User.findOne({username})
    if (!user) {
        throw new Error('Invalid Username')
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new Error('Invalid Password')
    }
    const token = jwt.sign({sub: user._id}, process.env.JWT_SECRET, {
        expiresIn: '24h',
    })
    return {token}
}

export async function createUser({username, password}) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({username, password: hashedPassword})
    return await user.save()
}

export async function getUserInfoById(userId) {
    try {
        const user = await User.findById(userId)
        if (!user) return {username: userId, tokens: 0}

        // ensure user has tokens field (for legacy users)
        if (user.tokens === undefined || user.tokens === null) {
            user.tokens = 100
            await user.save()
        }

        return {username: user.username, tokens: user.tokens ?? 0}
    } catch (error) {
        return {username: userId, tokens: 0}
    }
}




import moment from 'moment'
import { ObjectId } from 'mongodb'
import { MongooseFilterQuery } from 'mongoose'
import { Service } from 'typedi'

import { google, helpers } from '../lib'
import {
  LikeModel,
  Post,
  PostModel,
  ReportModel,
  User,
  UserModel
} from '../models'

@Service()
export class PostService {
  async nearby(
    user: User,
    coordinates: number[],
    distance: number,
    after?: string
  ): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {
      _id: {
        $nin: user.ignored
      },
      coordinates: {
        $near: {
          $geometry: {
            coordinates,
            type: 'Point'
          },
          $maxDistance: distance * 1000
        }
      }
    }

    if (after) {
      query.createdAt = {
        $lt: moment(after).toDate()
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    await this.fetchLikes(user, posts)

    return posts
  }

  async popular(user: User): Promise<Post[]> {
    const posts = await PostModel.find({
      _id: {
        $nin: user.ignored
      },
      createdAt: {
        $gte: moment().subtract(24, 'hours').toDate()
      },
      likes: {
        $gte: 100
      }
    })
      .sort({
        likes: -1,
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    await this.fetchLikes(user, posts)

    return posts
  }

  async latest(user: User, after?: string): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {
      _id: {
        $nin: user.ignored
      }
    }

    if (after) {
      query.createdAt = {
        $lt: moment(after).toDate()
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    await this.fetchLikes(user, posts)

    return posts
  }

  async create(user: User, body: string, coordinates: number[]): Promise<Post> {
    const location = await google.geocode(coordinates)

    const post = await PostModel.create({
      body,
      coordinates: {
        coordinates,
        type: 'Point'
      },
      location,
      user
    })

    await LikeModel.create({
      post,
      user
    })

    return post
  }

  async fetch(user: User, id: string): Promise<Post> {
    if (user.ignored.includes(ObjectId.createFromHexString(id))) {
      throw new Error('Post not found')
    }

    const post = await PostModel.findById(id).populate('user')

    if (!post) {
      throw new Error('Post not found')
    }

    const like = await LikeModel.findOne({
      post,
      user
    })

    post.liked = !!like

    return post
  }

  async like(user: User, id: string): Promise<Post> {
    const post = await PostModel.findById(id)

    if (!post) {
      throw new Error('Post not found')
    }

    const like = await LikeModel.findOne({
      post,
      user
    })

    if (like) {
      await LikeModel.findByIdAndDelete(like.id)

      const likes = await this.updateLikes(id)

      post.liked = false
      post.likes = likes

      return post
    }

    await LikeModel.create({
      post,
      user
    })

    const likes = await this.updateLikes(id)

    post.liked = true
    post.likes = likes

    return post
  }

  async flag(user: User, post: string, reason: string): Promise<boolean> {
    await ReportModel.create({
      post,
      reason,
      user
    })

    await UserModel.findByIdAndUpdate(user, {
      $push: {
        ignored: ObjectId.createFromHexString(post)
      }
    })

    return true
  }

  private async updateLikes(post: string): Promise<number> {
    const likes = await LikeModel.countDocuments({
      post
    })

    await PostModel.findByIdAndUpdate(post, {
      likes
    })

    return likes
  }

  private async fetchLikes(user: User, posts: Post[]): Promise<Post[]> {
    const likes = await LikeModel.find({
      post: {
        $in: posts.map(({ id }) => id)
      },
      user
    })

    posts.forEach((post) => {
      post.liked = !!likes.find((like) => helpers.equals(post.id, like.post))
    })

    return posts
  }
}

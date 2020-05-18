import moment from 'moment'
import { MongooseFilterQuery } from 'mongoose'
import { Service } from 'typedi'

import { google } from '../lib'
import {
  Comment,
  CommentModel,
  LikeModel,
  Post,
  PostModel,
  User
} from '../models'

@Service()
export class PostService {
  async nearby(coordinates: number[], after?: string): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {
      coordinates: {
        $geoWithin: {
          $center: [coordinates, 50]
        }
      }
    }

    if (after) {
      query._id = {
        $lt: after
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    return posts
  }

  async popular(after?: string): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {
      createdAt: {
        $gte: moment().subtract(24, 'hours').toDate()
      }
    }

    if (after) {
      query._id = {
        $lt: after
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        likes: 1,
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    return posts
  }

  async latest(after?: string): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {}

    if (after) {
      query._id = {
        $lt: after
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    return posts
  }

  async createPost(
    user: User,
    body: string,
    coordinates: number[]
  ): Promise<Post> {
    const location = await google.geocode(coordinates)

    const post = await PostModel.create({
      body,
      coordinates,
      location,
      user
    })

    await LikeModel.create({
      post,
      user
    })

    return post
  }

  async fetchPost(id: string): Promise<Post> {
    const post = await PostModel.findById(id)
      .populate({
        path: 'comments',
        populate: {
          path: 'user'
        }
      })
      .populate('user')

    if (!post) {
      throw new Error('Post not found')
    }

    return post
  }

  async likePost(user: User, post: string): Promise<number> {
    const like = await LikeModel.findOne({
      post,
      user
    })

    if (like) {
      await LikeModel.findByIdAndDelete(like.id)

      const likes = await this.updateLikes(post)

      return likes
    }

    await LikeModel.create({
      post,
      user
    })

    const likes = await this.updateLikes(post)

    return likes
  }

  async createComment(
    user: User,
    post: string,
    body: string
  ): Promise<Comment> {
    const comment = await CommentModel.create({
      body,
      post,
      user
    })

    return comment
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
}

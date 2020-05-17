import moment from 'moment'
import { Service } from 'typedi'

import {
  Comment,
  CommentModel,
  LikeModel,
  Post,
  PostModel,
  User
} from '../models'
import { Feed } from '../types/graphql'

@Service()
export class PostService {
  async feed(location?: number[]): Promise<Feed> {
    const latest = await PostModel.find()
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    const popular = await PostModel.find({
      createdAt: {
        $gte: moment().subtract(24, 'hours').toDate()
      }
    })
      .sort({
        likes: 1,
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    const nearby = location
      ? await PostModel.find({
          location: {
            $geoWithin: {
              $center: [location, 50]
            }
          }
        })
          .sort({
            createdAt: -1
          })
          .populate('user')
          .limit(100)
      : []

    return {
      latest,
      nearby,
      popular
    }
  }

  async createPost(
    user: User,
    body: string,
    location: number[]
  ): Promise<Post> {
    const post = await PostModel.create({
      body,
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

  async likePost(user: User, post: string): Promise<boolean> {
    const like = await LikeModel.findOne({
      post,
      user
    })

    if (like) {
      await LikeModel.findByIdAndDelete(like.id)

      await this.updateLikes(post)

      return false
    }

    await LikeModel.create({
      post,
      user
    })

    await this.updateLikes(post)

    return true
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

  private async updateLikes(post: string): Promise<void> {
    const likes = await LikeModel.countDocuments({
      post
    })

    await PostModel.findByIdAndUpdate(post, {
      likes
    })
  }
}

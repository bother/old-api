import moment from 'moment'
import { MongooseFilterQuery } from 'mongoose'
import { Inject, Service } from 'typedi'

import { auth } from '../lib'
import { Post, PostModel, User, UserModel } from '../models'
import { SignUpArgs } from '../types/args'
import { AuthResult } from '../types/graphql'
import { PostService } from './post'

@Service()
export class UserService {
  @Inject()
  posts!: PostService

  async signUp({ deviceId, pushToken }: SignUpArgs): Promise<AuthResult> {
    const user = await UserModel.create({
      deviceId,
      pushToken
    })

    const { firebaseToken, token } = await auth.createToken(user)

    return {
      firebaseToken,
      token,
      user
    }
  }

  async fetchPosts(user: User, before?: string): Promise<Post[]> {
    const query: MongooseFilterQuery<Post> = {
      user
    }

    if (before) {
      query.createdAt = {
        $lt: moment(before).toDate()
      }
    }

    const posts = await PostModel.find(query)
      .sort({
        createdAt: -1
      })
      .populate('user')
      .limit(100)

    await this.posts.fetchLikes(user, posts)

    return posts
  }
}

import { Service } from 'typedi'

import { Comment, CommentModel, PostModel, User } from '../models'

@Service()
export class CommentService {
  async fetch(post: string): Promise<Comment[]> {
    return CommentModel.find({
      post
    }).populate('user')
  }

  async create(user: User, post: string, body: string): Promise<Comment> {
    const comment = await CommentModel.create({
      body,
      post,
      user
    })

    await PostModel.findByIdAndUpdate(post, {
      $inc: {
        comments: 1
      }
    })

    return comment
  }
}

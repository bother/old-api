import { Inject, Service } from 'typedi'

import { helpers } from '../lib'
import { Comment, CommentModel, PostModel, User } from '../models'
import { NotificationService } from './notification'

@Service()
export class CommentService {
  @Inject()
  notification!: NotificationService

  async fetch(post: string): Promise<Comment[]> {
    return CommentModel.find({
      post
    }).populate('user')
  }

  async create(user: User, postId: string, body: string): Promise<Comment> {
    const post = await PostModel.findById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const comment = new CommentModel()

    comment.body = body
    comment.post = post
    comment.user = user

    await comment.save()

    await PostModel.findByIdAndUpdate(postId, {
      $inc: {
        comments: 1
      }
    })

    if (!helpers.equals(user.id, post.user)) {
      this.notification.comment(user, post)
    }

    return comment
  }
}

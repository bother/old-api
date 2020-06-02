import { Ref } from '@typegoose/typegoose'
import { Service } from 'typedi'

import { firebase } from '../lib'
import {
  Notification,
  NotificationModel,
  Post,
  User,
  UserModel
} from '../models'

@Service()
export class NotificationService {
  async count(user: User): Promise<number> {
    return NotificationModel.countDocuments({
      unread: true,
      user
    })
  }

  async fetch(user: User): Promise<Notification[]> {
    const notifications = await NotificationModel.find({
      user
    }).sort({
      updatedAt: -1
    })

    return notifications
  }

  async markAsRead(user: User, id: string): Promise<boolean> {
    await NotificationModel.findOneAndUpdate(
      {
        _id: id,
        user
      },
      {
        unread: false
      }
    )

    return true
  }

  async comment(user: User, post: Post): Promise<void> {
    await NotificationModel.findOneAndUpdate(
      {
        action: 'comment',
        targetId: post.id,
        targetType: 'post',
        user: post.user
      },
      {
        actor: user.id,
        unread: true
      },
      {
        upsert: true
      }
    )

    await this.notify(post.user, 'comment', post.id)
  }

  private async notify(
    userId: Ref<User>,
    action: string,
    id: string
  ): Promise<void> {
    const user = await UserModel.findById(userId).select('pushToken')

    if (!user || !user.pushToken) {
      return
    }

    const title = action === 'comment' ? 'New comment' : '¯_(ツ)_/¯'

    const body =
      action === 'comment' ? 'Someone commented on your post.' : '¯_(ツ)_/¯'

    const deeplink = `bother://${
      action === 'comment' ? 'post' : 'unknown'
    }/${id}`

    await firebase.messaging().send({
      data: {
        deeplink
      },
      notification: {
        body,
        title
      },
      token: user.pushToken
    })
  }
}

import { Ref } from '@typegoose/typegoose'
import { Service } from 'typedi'

import { firebase, helpers } from '../lib'
import {
  Notification,
  NotificationModel,
  Post,
  Thread,
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

  async like(user: User, post: Post): Promise<void> {
    await NotificationModel.findOneAndUpdate(
      {
        action: 'like',
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

    await this.notify(post.user, 'like', post.id)
  }

  async message(user: User, thread: Thread): Promise<void> {
    const receiver = helpers.equals(user.id, thread.receiver)
      ? thread.sender
      : thread.receiver

    await NotificationModel.findOneAndUpdate(
      {
        action: 'message',
        targetId: thread.id,
        targetType: 'thread',
        user: receiver
      },
      {
        actor: user.id,
        unread: true
      },
      {
        upsert: true
      }
    )

    await this.notify(receiver, 'message', thread.id)
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

    const title =
      action === 'comment'
        ? 'New comment'
        : action === 'message'
        ? 'New message'
        : '¯_(ツ)_/¯'

    const body =
      action === 'comment'
        ? 'Someone commented on your post.'
        : action === 'message'
        ? 'Someone sent you a message.'
        : '¯_(ツ)_/¯'

    const deeplink = `bother://${
      action === 'comment'
        ? 'post'
        : action === 'message'
        ? 'thread'
        : 'unknown'
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

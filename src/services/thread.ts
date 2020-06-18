import { DocumentType, isDocument } from '@typegoose/typegoose'
import moment from 'moment'
import { Inject, Service } from 'typedi'

import { helpers } from '../lib'
import {
  Message,
  MessageModel,
  PostModel,
  Thread,
  ThreadModel,
  User
} from '../models'
import { SerializedMessage, SerializedThread } from '../types'
import { NotificationService } from './notification'

@Service()
export class ThreadService {
  @Inject()
  notification!: NotificationService

  async fetch(user: User): Promise<Thread[]> {
    const threads = await ThreadModel.find({
      $or: [
        {
          receiver: user
        },
        {
          sender: user
        }
      ]
    })
      .sort({
        updatedAt: -1
      })
      .populate({
        path: 'last',
        populate: 'user'
      })
      .populate('post')
      .populate('receiver')
      .populate('sender')

    return threads
  }

  async fetchOne(user: User, id: string): Promise<Thread> {
    const thread = await ThreadModel.findOne({
      $or: [
        {
          receiver: user
        },
        {
          sender: user
        }
      ],
      _id: id
    })
      .populate({
        path: 'last',
        populate: 'user'
      })
      .populate('post')
      .populate('receiver')
      .populate('sender')

    if (!thread) {
      throw new Error('Thread not found')
    }

    return thread
  }

  async findOne(user: User, postId: string): Promise<Thread> {
    const thread = await ThreadModel.findOne({
      $or: [
        {
          receiver: user
        },
        {
          sender: user
        }
      ],
      post: postId
    })
      .populate({
        path: 'last',
        populate: 'user'
      })
      .populate('post')
      .populate('receiver')
      .populate('sender')

    if (!thread) {
      throw new Error('Thread not found')
    }

    return thread
  }

  async create(user: User, postId: string, body: string): Promise<Thread> {
    const post = await PostModel.findById(postId)

    if (!post) {
      throw new Error('Post not found')
    }

    const thread = await ThreadModel.create({
      post,
      receiver: post.user,
      sender: user
    })

    const message = await MessageModel.create({
      body,
      thread,
      user
    })

    thread.last = message

    await thread.save()

    this.notification.message(user, thread)

    await thread.populate('receiver').execPopulate()

    return thread
  }

  async end(user: User, id: string): Promise<boolean> {
    const thread = await ThreadModel.findById(id)

    if (!thread) {
      throw new Error('Thread not found')
    }

    if (
      !helpers.equals(user.id, thread.sender) &&
      !helpers.equals(user.id, thread.receiver)
    ) {
      throw new Error('Not your thread')
    }

    thread.ended = true

    await thread.save()

    return true
  }

  async messages(user: User, id: string): Promise<Message[]> {
    const thread = await this.checkThread(user, id)

    const messages = await MessageModel.find({
      thread
    })
      .populate('user')
      .sort({
        createdAt: -1
      })

    return messages
  }

  async send(
    user: User,
    id: string,
    body: string
  ): Promise<{
    message: Message
    thread: Thread
  }> {
    const thread = await this.checkThread(user, id)

    if (thread.ended) {
      throw new Error('This conversation is over')
    }

    const message = await MessageModel.create({
      body,
      thread,
      user
    })

    thread.last = message

    await thread.save()

    this.notification.message(user, thread)

    return {
      message,
      thread
    }
  }

  private async checkThread(
    user: User,
    id: string
  ): Promise<DocumentType<Thread>> {
    const thread = await ThreadModel.findById(id)

    if (!thread) {
      throw new Error('Thread not found')
    }

    if (
      !helpers.equals(user.id, thread.sender) &&
      !helpers.equals(user.id, thread.receiver)
    ) {
      throw new Error('Not your thread')
    }

    return thread
  }

  serializeMessage(message: Message): SerializedMessage {
    return {
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      id: message.id,
      thread: {
        id: isDocument(message.thread) ? message.thread.id : message.thread
      },
      user: {
        id: isDocument(message.user) ? message.user.id : message.user
      }
    }
  }

  deserializeMessage(message: SerializedMessage): Record<string, unknown> {
    return {
      body: message.body,
      createdAt: moment(message.createdAt).toDate(),
      id: message.id,
      user: {
        id: message.user.id
      }
    }
  }

  serializeThread(thread: Thread): SerializedThread {
    if (!isDocument(thread.last)) {
      throw new Error('Message not found')
    }

    return {
      createdAt: thread.createdAt.toISOString(),
      ended: thread.ended,
      id: thread.id,
      last: this.serializeMessage(thread.last),
      post: {
        id: isDocument(thread.post) ? thread.post.id : thread.post
      },
      receiver: {
        id: isDocument(thread.receiver) ? thread.receiver.id : thread.receiver
      },
      sender: {
        id: isDocument(thread.sender) ? thread.sender.id : thread.sender
      },
      updatedAt: thread.updatedAt.toISOString()
    }
  }

  deserializeThread(thread: SerializedThread): Record<string, unknown> {
    return {
      createdAt: moment(thread.createdAt).toDate(),
      ended: thread.ended,
      id: thread.id,
      last: this.deserializeMessage(thread.last),
      post: {
        id: thread.post.id
      },
      receiver: {
        id: thread.receiver.id
      },
      sender: {
        id: thread.sender.id
      },
      updatedAt: moment(thread.updatedAt).toDate()
    }
  }
}

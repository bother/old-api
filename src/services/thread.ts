import moment from 'moment'
import { Service } from 'typedi'

import { firebase } from '../lib'
import { PostModel, Thread, ThreadModel, User } from '../models'

@Service()
export class ThreadService {
  async fetch(user: User): Promise<Thread[]> {
    return ThreadModel.find({
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
      .populate('post')
      .populate('sender')
      .populate('receiver')
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
      .populate('post')
      .populate('sender')
      .populate('receiver')

    if (!thread) {
      throw new Error('Thread not found')
    }

    return thread
  }

  async findOne(user: User, postId: string): Promise<Thread> {
    const thread = await ThreadModel.findOne({
      post: postId,
      sender: user
    })
      .populate('post')
      .populate('sender')
      .populate('receiver')

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

    const thread = await ThreadModel.findOneAndUpdate(
      {
        post,
        receiver: post.user,
        sender: user
      },
      {
        last: body
      },
      {
        new: true,
        upsert: true
      }
    )
      .populate('post')
      .populate('sender')
      .populate('receiver')

    await firebase
      .firestore()
      .collection('messages')
      .add({
        body,
        createdAt: moment().toDate(),
        receiver: String(post.user),
        sender: user.id,
        thread: thread.id
      })

    return thread
  }
}

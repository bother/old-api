import { withFilter } from 'apollo-server-fastify'
import {
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
  Root,
  Subscription
} from 'type-graphql'
import { Inject } from 'typedi'

import { pubsub } from '..'
import { helpers } from '../lib'
import { Message, Thread, User } from '../models'
import { ThreadService } from '../services'
import { Context, SerializedMessage, SerializedThread } from '../types'
import {
  CreateThreadArgs,
  FetchMessagesArgs,
  FetchThreadArgs,
  FindThreadArgs,
  SendMessageArgs
} from '../types/args'

@Resolver()
export class ThreadResolver {
  @Inject()
  service!: ThreadService

  @Query(() => [Thread])
  @Authorized()
  threads(@Ctx('user') user: User): Promise<Thread[]> {
    return this.service.fetch(user)
  }

  @Query(() => Thread)
  @Authorized()
  thread(
    @Ctx('user') user: User,
    @Args() { id }: FetchThreadArgs
  ): Promise<Thread> {
    return this.service.fetchOne(user, id)
  }

  @Query(() => Thread)
  @Authorized()
  findThread(
    @Ctx('user') user: User,
    @Args() { postId }: FindThreadArgs
  ): Promise<Thread> {
    return this.service.findOne(user, postId)
  }

  @Mutation(() => Thread)
  @Authorized()
  createThread(
    @Ctx('user') user: User,
    @Args() { body, postId }: CreateThreadArgs
  ): Promise<Thread> {
    return this.service.create(user, postId, body)
  }

  @Mutation(() => Boolean)
  @Authorized()
  endThread(
    @Ctx('user') user: User,
    @Args() { id }: FetchThreadArgs
  ): Promise<boolean> {
    return this.service.end(user, id)
  }

  @Query(() => [Message])
  @Authorized()
  messages(
    @Ctx('user') user: User,
    @Args() { threadId }: FetchMessagesArgs
  ): Promise<Message[]> {
    return this.service.messages(user, threadId)
  }

  @Mutation(() => Message)
  @Authorized()
  async sendMessage(
    @Ctx('user') user: User,
    @Args() { body, threadId }: SendMessageArgs
  ): Promise<Message> {
    const { message, thread } = await this.service.send(user, threadId, body)

    await pubsub.publish(`NEW_MESSAGE.${threadId}`, {
      message: this.service.serializeMessage(message)
    })

    const receiver = helpers.equals(user.id, thread.sender)
      ? thread.receiver
      : thread.sender

    await pubsub.publish(`THREAD_UPDATED.${receiver}`, {
      thread: this.service.serializeThread(thread)
    })

    return message
  }

  @Subscription(() => Message, {
    subscribe: withFilter(
      (root, args) => pubsub.asyncIterator(`NEW_MESSAGE.${args.threadId}`),
      (payload, variables) => payload.message.thread.id === variables.threadId
    )
  })
  @Authorized()
  newMessage(
    @Args() args: FetchMessagesArgs,
    @Root('message') message: SerializedMessage
  ): Message {
    return (this.service.deserializeMessage(message) as unknown) as Message
  }

  @Subscription(() => Thread, {
    subscribe: withFilter(
      (root, args, { user }: Context) =>
        pubsub.asyncIterator(`THREAD_UPDATED.${user?.id}`),
      (payload, variables, { user }: Context) => {
        if (!user) {
          return false
        }

        return (
          helpers.equals(user.id, payload.thread.receiver.id) ||
          helpers.equals(user.id, payload.thread.sender.id)
        )
      }
    )
  })
  @Authorized()
  threadUpdated(@Root('thread') thread: SerializedThread): Thread {
    return (this.service.deserializeThread(thread) as unknown) as Thread
  }
}

import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'

import { Thread, User } from '../models'
import { ThreadService } from '../services'
import {
  CreateThreadArgs,
  FetchThreadArgs,
  FindThreadArgs
} from '../types/args'

@Resolver()
export class ThreadResolver {
  @Inject()
  service!: ThreadService

  @Query(() => [Thread])
  @Authorized()
  async threads(@Ctx('user') user: User): Promise<Thread[]> {
    return this.service.fetch(user)
  }

  @Query(() => Thread)
  @Authorized()
  async thread(
    @Ctx('user') user: User,
    @Args() { id }: FetchThreadArgs
  ): Promise<Thread> {
    return this.service.fetchOne(user, id)
  }

  @Query(() => Thread)
  @Authorized()
  async findThread(
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
}

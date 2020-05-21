import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { Comment, User } from '../models'
import { CommentService } from '../services'

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly service: CommentService) {}

  @Query(() => [Comment])
  @Authorized()
  async fetchComments(@Arg('postId') postId: string): Promise<Comment[]> {
    return this.service.fetch(postId)
  }

  @Mutation(() => Comment)
  @Authorized()
  createComment(
    @Ctx('user') user: User,
    @Arg('postId') postId: string,
    @Arg('body') body: string
  ): Promise<Comment> {
    return this.service.create(user, postId, body)
  }
}

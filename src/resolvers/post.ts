import {
  Arg,
  Authorized,
  Ctx,
  Float,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'

import { Comment, Post, User } from '../models'
import { PostService } from '../services'
import { Feed } from '../types/graphql'

@Resolver()
export class PostResolver {
  constructor(private readonly service: PostService) {}

  @Query(() => Feed)
  @Authorized()
  feed(
    @Arg('location', () => [Float], {
      nullable: true
    })
    location?: number[]
  ): Promise<Feed> {
    return this.service.feed(location)
  }

  @Mutation(() => Post)
  @Authorized()
  createPost(
    @Ctx('user') user: User,
    @Arg('body') body: string,
    @Arg('location', () => [Float]) location: number[]
  ): Promise<Post> {
    return this.service.createPost(user, body, location)
  }

  @Query(() => Post)
  @Authorized()
  fetchPost(@Arg('id') id: string): Promise<Post> {
    return this.service.fetchPost(id)
  }

  @Query(() => Boolean)
  @Authorized()
  likePost(@Ctx('user') user: User, @Arg('id') id: string): Promise<boolean> {
    return this.service.likePost(user, id)
  }

  @Query(() => Comment)
  @Authorized()
  createComment(
    @Ctx('user') user: User,
    @Arg('postId') postId: string,
    @Arg('body') body: string
  ): Promise<Comment> {
    return this.service.createComment(user, postId, body)
  }
}

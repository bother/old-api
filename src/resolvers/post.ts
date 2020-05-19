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
import { LikeResult } from '../types/graphql'

@Resolver()
export class PostResolver {
  constructor(private readonly service: PostService) {}

  @Query(() => [Post])
  @Authorized()
  nearby(
    @Arg('coordinates', () => [Float])
    coordinates: number[],
    @Arg('before', {
      nullable: true
    })
    before?: string
  ): Promise<Post[]> {
    return this.service.nearby(coordinates, before)
  }

  @Query(() => [Post])
  @Authorized()
  latest(
    @Arg('before', {
      nullable: true
    })
    before?: string
  ): Promise<Post[]> {
    return this.service.latest(before)
  }

  @Query(() => [Post])
  @Authorized()
  popular(): Promise<Post[]> {
    return this.service.popular()
  }

  @Mutation(() => Post)
  @Authorized()
  createPost(
    @Ctx('user') user: User,
    @Arg('body') body: string,
    @Arg('coordinates', () => [Float]) coordinates: number[]
  ): Promise<Post> {
    return this.service.createPost(user, body, coordinates)
  }

  @Query(() => Post)
  @Authorized()
  fetchPost(@Ctx('user') user: User, @Arg('id') id: string): Promise<Post> {
    return this.service.fetch(user, id)
  }

  @Mutation(() => LikeResult)
  @Authorized()
  likePost(
    @Ctx('user') user: User,
    @Arg('id') id: string
  ): Promise<LikeResult> {
    return this.service.like(user, id)
  }

  @Mutation(() => Comment)
  @Authorized()
  createComment(
    @Ctx('user') user: User,
    @Arg('postId') postId: string,
    @Arg('body') body: string
  ): Promise<Comment> {
    return this.service.comment(user, postId, body)
  }
}

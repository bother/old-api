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
    @Arg('coordinates', () => [Float], {
      nullable: true
    })
    coordinates?: number[]
  ): Promise<Feed> {
    return this.service.feed(coordinates)
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

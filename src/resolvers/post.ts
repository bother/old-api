import {
  Arg,
  Authorized,
  Ctx,
  Float,
  Int,
  Mutation,
  Query,
  Resolver
} from 'type-graphql'

import { Post, User } from '../models'
import { PostService } from '../services'

@Resolver(() => Post)
export class PostResolver {
  constructor(private readonly service: PostService) {}

  @Query(() => [Post])
  @Authorized()
  nearby(
    @Ctx('user') user: User,
    @Arg('coordinates', () => [Float])
    coordinates: number[],
    @Arg('distance', () => Int)
    distance: number,
    @Arg('before', {
      nullable: true
    })
    before?: string
  ): Promise<Post[]> {
    return this.service.nearby(user, coordinates, distance, before)
  }

  @Query(() => [Post])
  @Authorized()
  latest(
    @Ctx('user') user: User,
    @Arg('before', {
      nullable: true
    })
    before?: string
  ): Promise<Post[]> {
    return this.service.latest(user, before)
  }

  @Query(() => [Post])
  @Authorized()
  popular(@Ctx('user') user: User): Promise<Post[]> {
    return this.service.popular(user)
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

  @Mutation(() => Post)
  @Authorized()
  likePost(@Ctx('user') user: User, @Arg('id') id: string): Promise<Post> {
    return this.service.like(user, id)
  }
}

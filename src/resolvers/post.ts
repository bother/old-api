import {
  Arg,
  Authorized,
  Ctx,
  Float,
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

  @Mutation(() => Post)
  @Authorized()
  likePost(@Ctx('user') user: User, @Arg('id') id: string): Promise<Post> {
    return this.service.like(user, id)
  }
}

import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { Post, User } from '../models'
import { UserService } from '../services'
import { AuthResult } from '../types/graphql'

@Resolver()
export class UserResolver {
  constructor(private readonly service: UserService) {}

  @Query(() => User)
  @Authorized()
  profile(@Ctx('user') user: User): User {
    return user
  }

  @Query(() => [Post])
  @Authorized()
  posts(
    @Ctx('user') user: User,
    @Arg('before', {
      nullable: true
    })
    before?: string
  ): Promise<Post[]> {
    return this.service.fetchPosts(user, before)
  }

  @Mutation(() => AuthResult)
  signUp(): Promise<AuthResult> {
    return this.service.signUp()
  }
}

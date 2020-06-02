import { Args, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Inject } from 'typedi'

import { Post, User } from '../models'
import { NotificationService, UserService } from '../services'
import { PostsArgs, SignUpArgs } from '../types/args'
import { AuthResult, Profile } from '../types/graphql'

@Resolver()
export class UserResolver {
  @Inject()
  service!: UserService

  @Inject()
  notification!: NotificationService

  @Query(() => Profile)
  @Authorized()
  async profile(@Ctx('user') user: User): Promise<Profile> {
    const { id, rating } = user

    const notifications = await this.notification.count(user)

    return {
      id,
      notifications,
      rating
    }
  }

  @Query(() => [Post])
  @Authorized()
  posts(
    @Ctx('user') user: User,
    @Args() { before }: PostsArgs
  ): Promise<Post[]> {
    return this.service.fetchPosts(user, before)
  }

  @Mutation(() => AuthResult)
  signUp(@Args() data: SignUpArgs): Promise<AuthResult> {
    return this.service.signUp(data)
  }
}

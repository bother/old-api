import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { Post, User } from '../models'
import { NotificationService, UserService } from '../services'
import { AuthResult, Profile } from '../types/graphql'

@Resolver()
export class UserResolver {
  constructor(
    private readonly service: UserService,
    private readonly notification: NotificationService
  ) {}

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

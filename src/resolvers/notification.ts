import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { Notification, User } from '../models'
import { NotificationService } from '../services'

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly service: NotificationService) {}

  @Query(() => [Notification])
  @Authorized()
  notifications(@Ctx('user') user: User): Promise<Notification[]> {
    return this.service.fetch(user)
  }

  @Mutation(() => Boolean)
  @Authorized()
  markNotificationAsRead(
    @Ctx('user') user: User,
    @Arg('id') id: string
  ): Promise<boolean> {
    return this.service.markAsRead(user, id)
  }
}

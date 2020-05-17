import { Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql'

import { User } from '../models'
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

  @Mutation(() => AuthResult)
  signUp(): Promise<AuthResult> {
    return this.service.signUp()
  }
}

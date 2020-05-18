import { Field, ObjectType } from 'type-graphql'

import { Post, User } from '../models'

@ObjectType()
export class AuthResult {
  @Field()
  token!: string

  @Field(() => User)
  user!: User
}

@ObjectType()
export class Feed {
  @Field(() => [Post])
  nearby!: Post[]

  @Field(() => [Post])
  popular!: Post[]

  @Field(() => [Post])
  latest!: Post[]
}

@ObjectType()
export class Location {
  @Field()
  city!: string

  @Field()
  state!: string

  @Field()
  country!: string
}

import { prop } from '@typegoose/typegoose'
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
  @prop()
  city!: string

  @Field()
  @prop()
  state!: string

  @Field()
  @prop()
  country!: string
}

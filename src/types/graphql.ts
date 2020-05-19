import { prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

import { User } from '../models'

@ObjectType()
export class AuthResult {
  @Field()
  token!: string

  @Field(() => User)
  user!: User
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

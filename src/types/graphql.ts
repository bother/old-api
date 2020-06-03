import { prop } from '@typegoose/typegoose'
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { User } from '../models'

@ObjectType()
export class AuthResult {
  @Field()
  firebaseToken!: string

  @Field()
  token!: string

  @Field(() => User)
  user!: User
}

@ObjectType()
export class Profile {
  @Field(() => ID)
  id!: string

  @Field(() => Int)
  notifications!: number

  @Field()
  rating!: number
}

@ObjectType()
export class Location {
  @Field()
  @prop()
  city!: string

  @Field({
    nullable: true
  })
  @prop()
  state?: string

  @Field()
  @prop()
  country!: string
}

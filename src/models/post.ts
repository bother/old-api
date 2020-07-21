import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
  Severity
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { Coordinates } from '../types'
import { Location } from '../types/graphql'
import { User } from './user'

@ObjectType()
@modelOptions({
  options: {
    allowMixed: Severity.ALLOW
  },
  schemaOptions: {
    timestamps: true
  }
})
@index({
  createdAt: -1,
  user: 1
})
@index({
  coordinates: '2dsphere'
})
export class Post extends TimeStamps {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({
    required: true
  })
  body!: string

  @prop({
    required: true
  })
  coordinates!: Coordinates

  @Field(() => Location)
  @prop({
    _id: false,
    required: true
  })
  location!: Location

  @Field(() => Int)
  @prop({
    default: 1
  })
  likes!: number

  @Field(() => Int)
  @prop({
    default: 1
  })
  views!: number

  @Field(() => Int)
  @prop({
    default: 0
  })
  comments!: number

  @Field(() => User)
  @prop({
    ref: 'User',
    required: true
  })
  user!: Ref<User>

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date

  @Field()
  liked!: boolean
}

export const PostModel = getModelForClass(Post)

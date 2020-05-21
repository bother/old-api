import {
  arrayProp,
  getModelForClass,
  modelOptions,
  Ref
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, ObjectType } from 'type-graphql'

import { Post } from './post'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
export class User extends TimeStamps {
  @Field(() => ID)
  id!: string

  @arrayProp({
    default: [],
    ref: 'Post'
  })
  ignored!: Ref<Post>[]

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}

export const UserModel = getModelForClass(User)

import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, ObjectType } from 'type-graphql'

import { Post } from './post'
import { User } from './user'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
@index({
  post: 1,
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  createdAt: 1
})
export class Comment extends TimeStamps {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({
    required: true
  })
  body!: string

  @Field(() => Post)
  @prop({
    ref: 'Post',
    required: true
  })
  post!: Ref<Post>

  @Field(() => User)
  @prop({
    ref: 'User',
    required: true
  })
  user!: Ref<User>

  @Field()
  createdAt!: Date
}

export const CommentModel = getModelForClass(Comment)

import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import { Post } from './post'
import { User } from './user'

@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
@index(
  {
    post: 1,
    user: 1
  },
  {
    unique: true
  }
)
export class Like extends TimeStamps {
  id!: string

  @prop({
    ref: 'Post',
    required: true
  })
  post!: Ref<Post>

  @prop({
    ref: 'User',
    required: true
  })
  user!: Ref<User>
}

export const LikeModel = getModelForClass(Like)

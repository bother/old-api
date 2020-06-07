import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, ObjectType } from 'type-graphql'

import { Thread } from './thread'
import { User } from './user'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
@index({
  thread: 1,
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  createdAt: -1
})
export class Message extends TimeStamps {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({
    required: true
  })
  body!: string

  @Field(() => User)
  @prop({
    ref: 'User',
    required: true
  })
  user!: Ref<User>

  @prop({
    ref: 'Thread',
    required: true
  })
  thread!: Ref<Thread>

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}

export const MessageModel = getModelForClass(Message)

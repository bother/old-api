import {
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, ObjectType } from 'type-graphql'

import { User } from './user'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
@index({
  user: 1,
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  createdAt: 1
})
@index({
  user: 1,
  // eslint-disable-next-line sort-keys-fix/sort-keys-fix
  unread: 1
})
export class Notification extends TimeStamps {
  @Field(() => ID)
  id!: string

  @Field()
  @prop({
    required: true
  })
  action!: 'comment'

  @Field()
  @prop({
    required: true
  })
  targetType!: string

  @Field()
  @prop({
    required: true
  })
  targetId!: string

  @Field()
  @prop({
    default: true
  })
  unread!: boolean

  @prop({
    ref: 'User',
    required: true
  })
  user!: Ref<User>

  @Field()
  createdAt!: Date

  @Field()
  updatedAt!: Date
}

export const NotificationModel = getModelForClass(Notification)

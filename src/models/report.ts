import { getModelForClass, modelOptions, prop, Ref } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import { Post } from './post'
import { User } from './user'

@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
export class Report extends TimeStamps {
  @prop({
    required: true
  })
  reason!: string

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

export const ReportModel = getModelForClass(Report)

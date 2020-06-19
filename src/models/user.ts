import {
  getModelForClass,
  index,
  modelOptions,
  prop
} from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
@modelOptions({
  schemaOptions: {
    timestamps: true
  }
})
@index(
  {
    deviceId: 1
  },
  {
    unique: true
  }
)
export class User extends TimeStamps {
  @Field(() => ID)
  id!: string

  @prop({
    select: false
  })
  deviceId!: string

  @Field()
  @prop({
    default: 5
  })
  rating!: number

  @prop({
    default: [],
    type: String
  })
  ignored!: string[]

  @prop({
    select: false
  })
  pushToken?: string
}

export const UserModel = getModelForClass(User)

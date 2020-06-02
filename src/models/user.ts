import {
  arrayProp,
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

  @prop()
  deviceId!: string

  @Field()
  @prop({
    default: 5
  })
  rating!: number

  @arrayProp({
    default: [],
    items: String
  })
  ignored!: string[]

  @prop()
  pushToken?: string
}

export const UserModel = getModelForClass(User)

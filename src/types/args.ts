import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class SignUpArgs {
  @Field()
  deviceId!: string

  @Field({
    nullable: true
  })
  pushToken?: string
}

@ArgsType()
export class PostsArgs {
  @Field({
    nullable: true
  })
  before?: string
}

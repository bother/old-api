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

@ArgsType()
export class CreateThreadArgs {
  @Field()
  postId!: string

  @Field()
  body!: string
}

@ArgsType()
export class FetchThreadArgs {
  @Field()
  id!: string
}

@ArgsType()
export class FindThreadArgs {
  @Field()
  postId!: string
}

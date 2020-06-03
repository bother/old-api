import { CommentResolver } from './comment'
import { NotificationResolver } from './notification'
import { PostResolver } from './post'
import { ThreadResolver } from './thread'
import { UserResolver } from './user'

export const resolvers = [
  CommentResolver,
  NotificationResolver,
  PostResolver,
  ThreadResolver,
  UserResolver
]

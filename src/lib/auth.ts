const { TOKEN_SECRET } = process.env

import { AuthenticationError } from 'apollo-server-fastify'
import { sign, verify } from 'jsonwebtoken'
import { AuthChecker } from 'type-graphql'

import { User, UserModel } from '../models'
import { AuthToken, Context, RequestWithContext } from '../types'

export const authChecker: AuthChecker<Context, number> = async ({
  context: { user }
}): Promise<boolean> => !!user

class Auth {
  createToken(user: User): string {
    return sign(
      {
        id: user.id
      },
      TOKEN_SECRET
    )
  }

  async getUser(request: RequestWithContext): Promise<User | undefined> {
    const authorization = request.connection
      ? request.connection.context.Authorization
      : request.headers.authorization

    if (!authorization) {
      return
    }

    const token = authorization.substr(7)

    if (!token) {
      throw new AuthenticationError('Invalid token')
    }

    const { id } = verify(token, TOKEN_SECRET) as AuthToken

    if (!id) {
      throw new AuthenticationError('Invalid token')
    }

    const user = await UserModel.findById(id)

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    return user
  }
}

export const auth = new Auth()

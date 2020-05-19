import { Service } from 'typedi'

import { auth } from '../lib'
import { UserModel } from '../models'
import { AuthResult } from '../types/graphql'

@Service()
export class UserService {
  async signUp(): Promise<AuthResult> {
    const user = await UserModel.create({})

    const token = auth.createToken(user)

    return {
      token,
      user
    }
  }
}

import { Ref } from '@typegoose/typegoose'
import { ObjectId } from 'bson'

import { User } from '../models'

class Helpers {
  equals(id: string, user: Ref<User>): boolean {
    return ObjectId.createFromHexString(id).equals(user as ObjectId)
  }
}

export const helpers = new Helpers()

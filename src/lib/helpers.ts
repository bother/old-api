import { Ref } from '@typegoose/typegoose'
import { ObjectId } from 'bson'

import { Post, User } from '../models'

class Helpers {
  equals(id: string, ref: Ref<Post | User>): boolean {
    return ObjectId.createFromHexString(id).equals(ref as ObjectId)
  }
}

export const helpers = new Helpers()

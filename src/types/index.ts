import { User } from '../models'

export type AuthToken = {
  id: string
}

export type Context = {
  user?: User
}

export type Coordinates = {
  type: 'Point'
  coordinates: number[]
}

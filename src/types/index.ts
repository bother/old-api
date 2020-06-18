import { FastifyRequest } from 'fastify'

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

export type SerializedMessage = {
  body: string
  createdAt: string
  id: string
  thread: {
    id: string
  }
  user: {
    id: string
  }
}

export type SerializedThread = {
  createdAt: string
  ended: boolean
  id: string
  last: SerializedMessage
  post: {
    id: string
  }
  receiver: {
    id: string
  }
  sender: {
    id: string
  }
  updatedAt: string
}

export interface RequestWithContext extends FastifyRequest {
  connection: {
    context: {
      Authorization?: string
    }
  }
}

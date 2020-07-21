const { NODE_ENV, PORT } = process.env

import 'reflect-metadata'

import { ApolloServer, PubSub } from 'apollo-server-fastify'
import fastify from 'fastify'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'

import { auth, authChecker } from './lib'
import { resolvers } from './resolvers'
import { Context } from './types'

export const pubsub = new PubSub()

const main = async (): Promise<void> => {
  const api = fastify()

  const schema = await buildSchema({
    authChecker,
    container: Container,
    dateScalarMode: 'isoDate',
    resolvers,
    validate: false
  })

  const apollo = new ApolloServer({
    context: async ({ connection, request }): Promise<Context> => ({
      user: await auth.getUser(connection || request)
    }),
    introspection: NODE_ENV === 'development',
    playground: NODE_ENV === 'development',
    schema
  })

  api.register(apollo.createHandler())
  apollo.installSubscriptionHandlers(api.server)

  api.get('/', (request, reply) => {
    reply.redirect('https://bother.app')
  })

  await api.listen(Number(PORT), '0.0.0.0')

  console.log(`Running on ${PORT}`)
}

main()

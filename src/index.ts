const { PORT } = process.env

import 'reflect-metadata'

import { ApolloServer } from 'apollo-server-fastify'
import fastify, { FastifyRequest } from 'fastify'
import { buildSchema } from 'type-graphql'
import { Container } from 'typedi'

import { auth, authChecker } from './lib'
import { resolvers } from './resolvers'
import { Context } from './types'

const main = async (): Promise<void> => {
  const server = fastify()

  const schema = await buildSchema({
    authChecker,
    container: Container,
    dateScalarMode: 'isoDate',
    resolvers,
    validate: false
  })

  const apollo = new ApolloServer({
    context: async (request: FastifyRequest): Promise<Context> => ({
      user: await auth.getUser(request)
    }),
    schema
  })

  server.register(apollo.createHandler())

  await server.listen(Number(PORT), '0.0.0.0')

  console.log(`Running on ${PORT}`)
}

main()

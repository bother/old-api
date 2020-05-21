import cities from 'all-the-cities'
import chance from 'chance'
import { chunk, random, range, sample, sampleSize } from 'lodash'
import moment from 'moment'
import { ObjectId } from 'mongodb'

import { CommentModel, LikeModel, PostModel, UserModel } from '../src/models'

const main = async (): Promise<void> => {
  const likes = []
  const comments = []

  // users

  const users = await UserModel.insertMany(range(10000).map(() => ({})))

  console.log('users seeded')

  // posts

  await Promise.all(
    chunk(
      range(20000).map(() => {
        const city = sample(cities)

        const time = moment().subtract(random(14400), 'minutes')

        const post = {
          _id: ObjectId.createPk(),
          body: chance().paragraph(),
          comments: random(0, 10),
          coordinates: city.loc.coordinates,
          createdAt: time,
          likes: random(0, 111),
          location: {
            city: city.name,
            country: city.country,
            state: isNaN(city.adminCode) ? city.adminCode : undefined
          },
          updatedAt: time,
          user: sample(users).id
        }

        const likers = sampleSize(users, post.likes).map((user) => ({
          post: post._id,
          user: user.id
        }))

        likes.push(...likers)

        comments.push(
          ...range(post.comments).map(() => ({
            body: chance().sentence(),
            post: post._id,
            user: sample(users).id
          }))
        )

        return post
      }),
      10000
    ).map((posts) => PostModel.insertMany(posts))
  )

  console.log('posts seeded')

  // likes

  console.log('likes', likes.length)

  await Promise.all(
    chunk(likes, 10000).map((likes) => LikeModel.insertMany(likes))
  )

  console.log('likes seeded')

  // comments

  console.log('comments', comments.length)

  await Promise.all(
    chunk(comments, 10000).map((comments) => CommentModel.insertMany(comments))
  )

  console.log('comments seeded')

  console.log('done')

  process.exit()
}

main()

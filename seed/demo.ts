import chance from 'chance'
import { random, range, sampleSize } from 'lodash'
import moment from 'moment'

import { LikeModel, PostModel, UserModel } from '../src/models'

const main = async (): Promise<void> => {
  // users

  const users = await UserModel.insertMany(
    range(500).map(() => ({
      deviceId: chance().guid(),
      pushToken: chance().android_id()
    }))
  )

  console.log('users seeded')

  // posts

  const posts = await PostModel.find()

  await Promise.all(
    posts.map(async (post) => {
      post.views = random(100, 1000)

      return post.save()
    })
  )

  console.log('posts seeded')

  // likes

  await Promise.all(
    posts.map(async (post) => {
      const count = random(200)

      await LikeModel.insertMany(
        sampleSize(users, count).map((user) => {
          const time = moment(post.createdAt)
            .add(random(300), 'minutes')
            .toDate()

          return {
            createdAt: time,
            post: post.id,
            updatedAt: time,
            user: user.id
          }
        })
      )

      post.likes = count

      return post.save()
    })
  )

  console.log('likes seeded')

  // done

  console.log('done')

  process.exit()
}

main()

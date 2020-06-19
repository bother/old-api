import cities from 'all-the-cities'
import chance from 'chance'
import countries from 'i18n-iso-countries'
import { maxBy, random, range, sample, sampleSize } from 'lodash'
import moment from 'moment'

import {
  CommentModel,
  LikeModel,
  NotificationModel,
  PostModel,
  UserModel
} from '../src/models'

const main = async (): Promise<void> => {
  // users

  const users = await UserModel.insertMany(
    range(100).map(() => ({
      deviceId: chance().guid(),
      pushToken: chance().android_id()
    }))
  )

  console.log('users seeded')

  // posts

  const posts = await PostModel.insertMany(
    range(500)
      .map(() => {
        const city = sample(cities)

        const time = moment().subtract(random(14400), 'minutes').toDate()

        const user = sample(users)

        if (!user) {
          return null
        }

        return {
          body: chance().paragraph(),
          comments: random(0, 20),
          coordinates: city.loc,
          createdAt: time,
          likes: random(0, random(100, 200)),
          location: {
            city: city.name,
            country: countries.getName(city.country, 'en'),
            state: isNaN(city.adminCode) ? city.adminCode : undefined
          },
          updatedAt: time,
          user: user.id,
          views: random(0, 1000)
        }
      })
      .filter(Boolean)
  )

  console.log('posts seeded')

  // likes

  await Promise.all(
    posts.map(async (post) => {
      const likes = await LikeModel.insertMany(
        sampleSize(users, post.likes).map((user) => {
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

      await NotificationModel.insertMany(
        likes.map((like) => ({
          action: 'like',
          actor: like.user,
          createdAt: like.createdAt,
          targetId: post.id,
          targetType: 'post',
          updatedAt: like.createdAt,
          user: post.user
        }))
      )
    })
  )

  console.log('likes seeded')

  // comments

  await Promise.all(
    posts.map(async (post) => {
      const comments = await CommentModel.insertMany(
        sampleSize(users, post.comments).map((user) => {
          const time = moment(post.createdAt)
            .add(random(300), 'minutes')
            .toDate()

          return {
            body: chance().paragraph(),
            createdAt: time,
            post: post.id,
            updatedAt: time,
            user: user.id
          }
        })
      )

      await NotificationModel.insertMany(
        comments.map((comment) => ({
          action: 'comment',
          actor: comment.user,
          createdAt: comment.createdAt,
          targetId: post.id,
          targetType: 'post',
          updatedAt: comment.createdAt,
          user: post.user
        }))
      )
    })
  )

  console.log('comments seeded')

  // assign users to device

  const deviceIds = [
    'F1D38C35-793B-412A-BC3B-D2AB96366AE5',
    '7A0A3203-BF7C-4A60-96D5-B2FA151795EA'
  ]

  const byPost = await PostModel.aggregate([
    {
      $group: {
        _id: '$user',
        count: {
          $sum: 1
        }
      }
    }
  ])

  const { _id: first } = maxBy(byPost, 'count')

  await UserModel.findByIdAndUpdate(first, {
    deviceId: deviceIds[0]
  })

  const byNotification = await NotificationModel.aggregate([
    {
      $group: {
        _id: '$user',
        count: {
          $sum: 1
        }
      }
    }
  ])

  const { _id: second } = maxBy(byNotification, 'count')

  await UserModel.findByIdAndUpdate(second, {
    deviceId: deviceIds[1]
  })

  // done

  console.log('done')

  process.exit()
}

main()

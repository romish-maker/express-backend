import { app } from '../../app'
import { testingRouter } from '../../../modules/common/testing'
import { blogsRouter } from '../../../modules/blogs'
import { postsRouter } from '../../../modules/posts'
import { usersRouter } from '../../../modules/users'
import { authRouter } from '../../../modules/auth'
import { commentsRouter } from '../../../modules/comments'
import { devicesRouter } from '../../../modules/devices'

const RoutesList = {
  BASE: '/',
  BLOGS: '/blogs',
  POSTS: '/posts',
  USERS: '/users',
  AUTH: '/auth',
  DEVICES: '/security/devices',
  COMMENTS: '/comments',
  VERSION: '/version',
  TESTING: '/testing',
}

function initAppRoutes() {
  app.use(RoutesList.BLOGS, blogsRouter)
  app.use(RoutesList.POSTS, postsRouter)
  app.use(RoutesList.USERS, usersRouter)
  app.use(RoutesList.AUTH, authRouter)
  app.use(RoutesList.DEVICES, devicesRouter)
  app.use(RoutesList.COMMENTS, commentsRouter)
  app.use(RoutesList.TESTING, testingRouter)

  app.get(RoutesList.BASE, (req, res) => {
    res.send('Welcome to JoymeStudios Blogs App!')
  })

  app.get(RoutesList.VERSION, (req, res) => {
    res.send('blogs-inc-joyme: v3.4.0')
  })
}

export {
  RoutesList,
  initAppRoutes,
}

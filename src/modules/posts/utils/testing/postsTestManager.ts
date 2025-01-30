import { RoutesList } from '../../../../app/config/routes'
import { HttpStatusCode } from '../../../common/enums'
import { app } from '../../../../app/app'
import { testPostInput } from '../../mocks/postsMock'
import { PostsMongooseModel } from '../../../../app/config/db'
import { blogsTestManager } from '../../../blogs/utils/testing/blogsTestManager'
import { usersTestManager } from '../../../users/utils/testing/usersTestManager'
import { userInputMock } from '../../../users'

const supertest = require('supertest')

const request = supertest(app)

class PostsTestManager {
  async createPost(payload: {
    blogId?: string
    shouldExpect?: boolean
    user?: string
    password?: string
    expectedStatusCode?: HttpStatusCode
    checkedData?: { field: string, value: any }
  } = {}) {
    const {
      shouldExpect = false,
      user = 'admin',
      password = 'qwerty',
      expectedStatusCode = HttpStatusCode.CREATED_201,
      checkedData,
    } = payload

    const createdBlog = await blogsTestManager.createBlog()

    const result = await request.post(RoutesList.POSTS)
      .auth(user, password)
      .send(checkedData
        ? { ...testPostInput, blogId: createdBlog.body.id, [checkedData.field]: checkedData.value }
        : { ...testPostInput, blogId: createdBlog.body.id })
      .expect(expectedStatusCode)

    if (shouldExpect && expectedStatusCode === HttpStatusCode.CREATED_201) {
      const post = await PostsMongooseModel.findOne({ _id: result.body.id })

      expect(result.body.title).toBe(testPostInput.title)
      expect(result.body.blogId).toBe(createdBlog.body.id)
      expect(post?.shortDescription).toStrictEqual(testPostInput.shortDescription)
      expect(post?._id.toString()).toStrictEqual(expect.any(String))
    }

    if (shouldExpect && expectedStatusCode === HttpStatusCode.BAD_REQUEST_400 && checkedData?.field) {
      const posts = await PostsMongooseModel.find({})

      expect(result.body.errorsMessages.length).toBe(1)
      expect(result.body.errorsMessages[0].field).toBe(checkedData.field)
      expect(result.body.errorsMessages[0].message).toStrictEqual(expect.any(String))
      expect(posts.length).toBe(0)
    }

    return result
  }
  async createComment() {
    const createdPost = await this.createPost()
    const createUser = await usersTestManager.createUser()
    const resultLogin = await request.post(`${RoutesList.AUTH}/login`)
      .send({
        loginOrEmail: createUser.body.login,
        password: userInputMock.password,
      })
      .expect(HttpStatusCode.OK_200)

    const commentResult = await request.post(`${RoutesList.POSTS}/${createdPost.body.id}/comments`)
      .auth(resultLogin.body.accessToken, { type: 'bearer' })
      .send({ content: `This is my comment to ${createdPost.body.title} post <3`})
      .expect(HttpStatusCode.CREATED_201)

    return { postId: createdPost.body.id, comment: commentResult.body, accessToken: resultLogin.body.accessToken }
  }
}

export const postsTestManager = new PostsTestManager()

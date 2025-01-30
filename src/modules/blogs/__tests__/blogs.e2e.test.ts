import { app } from '../../../app/app'
import { RoutesList } from '../../../app/config/routes'
import { HttpStatusCode } from '../../common/enums'
import { testBlog, testBlogInput, testUpdateBlogInput, wrongBLogId } from '../mocks/blogsMock'
import { blogsTestManager } from '../utils/testing/blogsTestManager'
import { BlogsMongooseModel } from '../../../app/config/db'
import { memoryService } from '../../common/services'

const supertest = require('supertest')

const request = supertest(app)

describe('/blogs route GET tests: ',() => {
  beforeAll(async ()=> {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('GET /blogs', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    const result = await request.get(RoutesList.BLOGS).expect(HttpStatusCode.OK_200)

    expect(result.body.items.length).toBe(1)
    expect(result.body.items[0].name).toBe(createdBlog.body.name)
    expect(result.body.totalCount).toBe(1)
    expect(result.body.pageSize).toBe(10)
  })

  it('GET /blogs success query params', async () => {
    await blogsTestManager.createBlog()

    const result = await request
      .get(RoutesList.BLOGS)
      .query({
        pageNumber: 4,
        pageSize: 20,
      })
      .expect(HttpStatusCode.OK_200)

    expect(result.body.page).toBe(4)
    expect(result.body.pageSize).toBe(20)
    expect(result.body.totalCount).toBe(1)
    expect(result.body.items.length).toBe(0)
  })

  it('GET /blogs get posts by blog id', async () => {
    const createdBlog = await blogsTestManager.createBlog()
    await request
      .post(`${RoutesList.BLOGS}/${createdBlog.body.id}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'Abrakadabra',
        shortDescription: 'A spell',
        content: 'Spell that kills all sh$t code',
      })
      .expect(HttpStatusCode.CREATED_201)

    const result = await request.get(`${RoutesList.BLOGS}/${createdBlog.body.id}/posts`).expect(HttpStatusCode.OK_200)

    expect(result.body.items.length).toBe(1)
    expect(result.body.items[0].title).toBe('Abrakadabra')
    expect(result.body.totalCount).toBe(1)
    expect(result.body.pageSize).toBe(10)
  })

  it('GET /blogs/:id success', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    const result = await request.get(`${RoutesList.BLOGS}/${createdBlog.body.id}`).expect(HttpStatusCode.OK_200)

    expect(result.body.websiteUrl).toBe(testBlogInput.websiteUrl)
    expect(result.body.id).toStrictEqual(expect.any(String))
    expect(result.body.id).toBe(createdBlog.body.id)
  })

  it('GET /blogs/:id 404 not found', async () => {
    await blogsTestManager.createBlog()

    await request.get(`${RoutesList.BLOGS}/${wrongBLogId}`).expect(HttpStatusCode.NOT_FOUND_404)
  })
})

describe('/blogs route POST tests: ', () => {
  beforeAll(async ()=> {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('POST /blogs success', async () => {
    await blogsTestManager.createBlog({ shouldExpect: true })
  })

  it('POST /blogs create post by blog id', async () => {
    const createdBlog = await blogsTestManager.createBlog()
    const createdPost = await request
      .post(`${RoutesList.BLOGS}/${createdBlog.body.id}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'Abrakadabra',
        shortDescription: 'A spell',
        content: 'Spell that kills all sh$t code',
      })
      .expect(HttpStatusCode.CREATED_201)

    expect(createdPost.body.title).toBe('Abrakadabra')
    expect(createdPost.body.shortDescription).toBe('A spell')
  })

  it('POST /blogs create post by blog id failed bearer auth', async () => {
    const createdBlog = await blogsTestManager.createBlog()
    const createdPost = await request
      .post(`${RoutesList.BLOGS}/${createdBlog.body.id}/posts`)
      .auth('YWRtaW46cXdlcnR5', { type: 'bearer' })
      .send({
        title: 'Abrakadabra',
        shortDescription: 'A spell',
        content: 'Spell that kills all sh$t code',
      })
      .expect(HttpStatusCode.UNAUTHORIZED_401)

    expect(createdPost.body.title).toBe(undefined)
  })

  it('POST /blogs failed::unauthorized', async () => {
    await blogsTestManager.createBlog({ user: 'wrong', password: 'auth', expectedStatusCode: HttpStatusCode.UNAUTHORIZED_401 })
    await blogsTestManager.createBlog({ user: 'admin', password: 'wrongPass', expectedStatusCode: HttpStatusCode.UNAUTHORIZED_401 })
    await blogsTestManager.createBlog({ user: 'wrongUser', password: 'qwerty', expectedStatusCode: HttpStatusCode.UNAUTHORIZED_401 })

    const blogs = await BlogsMongooseModel.find({})

    expect(blogs.length).toBe(0)
  })

  it('POST /blogs failed::name:notString', async () => {
    await blogsTestManager.createBlog({
      shouldExpect: true,
      checkedData: { field: 'name', value: null },
      expectedStatusCode: HttpStatusCode.BAD_REQUEST_400,
    })
  })

  it('POST /blogs failed::name:tooLong', async () => {
    await blogsTestManager.createBlog({
      shouldExpect: true,
      checkedData: { field: 'name', value: '1234567890123456'},
      expectedStatusCode: HttpStatusCode.BAD_REQUEST_400,
    })
  })

  it('POST /blogs failed::description:emptyString', async () => {
    await blogsTestManager.createBlog({
      shouldExpect: true,
      checkedData: { field: 'description', value: ''},
      expectedStatusCode: HttpStatusCode.BAD_REQUEST_400,
    })
  })

  it('POST /blogs failed::websiteUrl:incorrectUrl', async () => {
    const res = await blogsTestManager.createBlog({
      shouldExpect: true,
      checkedData: { field: 'websiteUrl', value: 'https//my-website.top'},
      expectedStatusCode: HttpStatusCode.BAD_REQUEST_400,
    })

    expect(res.body.errorsMessages[0].message).toBe('Must be a valid URL')
  })
})

describe('/blogs route PUT tests: ', () => {
  beforeAll(async ()=> {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('PUT /blogs success', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    await request.put(`${RoutesList.BLOGS}/${createdBlog.body.id}`)
      .auth('admin', 'qwerty')
      .send(testUpdateBlogInput)
      .expect(HttpStatusCode.NO_CONTENT_204)

    const blog = await BlogsMongooseModel.findOne({ _id: createdBlog.body.id })

    expect(blog?.name).toBe(testUpdateBlogInput.name)
    expect(blog?._id.toString()).toBe(createdBlog.body.id)
    expect(blog?.websiteUrl).not.toBe(testBlog.websiteUrl)
  })

  it('PUT /blogs failed::unauthorized', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    await request.put(`${RoutesList.BLOGS}/${createdBlog.body.id}`)
      .auth('failed', 'password')
      .send(testUpdateBlogInput)
      .expect(HttpStatusCode.UNAUTHORIZED_401)

    const blog = await BlogsMongooseModel.findOne({ _id: createdBlog.body.id })

    expect(blog?.name).toBe(testBlogInput.name)
  })

  it('PUT /blogs failed::notFound', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    await request.put(`${RoutesList.BLOGS}/${wrongBLogId}`)
      .auth('admin', 'qwerty')
      .send(testUpdateBlogInput)
      .expect(HttpStatusCode.NOT_FOUND_404)

    const blog = await BlogsMongooseModel.findOne({ _id: createdBlog.body.id })

    expect(blog?.name).toBe(createdBlog.body.name)
    expect(blog?.websiteUrl).not.toBe(testUpdateBlogInput.websiteUrl)
  })
})

describe('/blogs route DELETE tests: ', () => {
  beforeAll(async ()=> {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('DELETE /blogs/:id success', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    await request.delete(`${RoutesList.BLOGS}/${createdBlog.body.id}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatusCode.NO_CONTENT_204)

    const blogs = await BlogsMongooseModel.find({})

    expect(blogs.length).toBe(0)
  })

  it('DELETE /blogs/:id failed::notAuthorized', async () => {
    const createdBlog = await blogsTestManager.createBlog()

    await request.delete(`${RoutesList.BLOGS}/${createdBlog.body.id}`)
      .auth('failed', 'password')
      .expect(HttpStatusCode.UNAUTHORIZED_401)

    const blogs = await BlogsMongooseModel.find({})

    expect(blogs.length).toBe(1)
  })

  it('DELETE /blogs/:id failed::notFound', async () => {
    await blogsTestManager.createBlog()

    await request.delete(`${RoutesList.BLOGS}/${wrongBLogId}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatusCode.NOT_FOUND_404)

    const blogs = await BlogsMongooseModel.find({})

    expect(blogs.length).toBe(1)
  })
})

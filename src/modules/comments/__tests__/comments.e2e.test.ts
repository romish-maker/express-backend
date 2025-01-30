import { app } from '../../../app/app'
import { memoryService } from '../../common/services'
import { RoutesList } from '../../../app/config/routes'
import { postsTestManager } from '../../posts/utils/testing/postsTestManager'
import { HttpStatusCode } from '../../common/enums'
import { LikeStatuses } from '../model/enums/LikeStatuses'

const supertest = require('supertest')

const request = supertest(app)

describe('/comments route tests: ', () => {
  beforeAll(async () => {
    await memoryService.connect()
  })
  afterAll(async () => {
    // Closing the DB connection allows Jest to exit successfully.
    await memoryService.close()
  })
  beforeEach(async () => {
    await request.delete(`${RoutesList.TESTING}/all-data`)
  })

  it('GET /comments/:commentId success', async () => {
    const { comment } = await postsTestManager.createComment()
    const result = await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.OK_200)

    expect(result.body.id).toBe(comment.id)
    expect(result.body.likesInfo.likesCount).toBe(0)
    expect(result.body.likesInfo.dislikesCount).toBe(0)
    expect(result.body.likesInfo.myStatus).toBe(LikeStatuses.NONE)
  })

  it('GET /comments/:commentId failed:notFound', async () => {
    await postsTestManager.createComment()
    await request.get(`${RoutesList.COMMENTS}/123456789012345678901234`).expect(HttpStatusCode.NOT_FOUND_404)
  })

  it('PUT /comments/:commentId success', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.put(`${RoutesList.COMMENTS}/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .send({ content: 'new comment content!!!' })
      .expect(HttpStatusCode.NO_CONTENT_204)
  })

  it('GET /comments/:commentId/like-status LIKE success', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.put(`${RoutesList.COMMENTS}/${comment.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatuses.LIKE })
      .expect(HttpStatusCode.NO_CONTENT_204)
    const result = await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.OK_200)
    const resultMyStatus = await request.get(`${RoutesList.COMMENTS}/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.OK_200)

    expect(result.body.id).toBe(comment.id)
    expect(result.body.likesInfo.likesCount).toBe(1)
    expect(result.body.likesInfo.dislikesCount).toBe(0)
    expect(result.body.likesInfo.myStatus).toBe(LikeStatuses.NONE)
    expect(resultMyStatus.body.likesInfo.myStatus).toBe(LikeStatuses.LIKE)
  })

  it('GET /comments/:commentId/like-status DISLIKE success', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.put(`${RoutesList.COMMENTS}/${comment.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatuses.DISLIKE })
      .expect(HttpStatusCode.NO_CONTENT_204)
    const result = await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.OK_200)
    const resultMyStatus = await request.get(`${RoutesList.COMMENTS}/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.OK_200)

    expect(result.body.id).toBe(comment.id)
    expect(result.body.likesInfo.likesCount).toBe(0)
    expect(result.body.likesInfo.dislikesCount).toBe(1)
    expect(result.body.likesInfo.myStatus).toBe(LikeStatuses.NONE)
    expect(resultMyStatus.body.likesInfo.myStatus).toBe(LikeStatuses.DISLIKE)
  })

  it('GET /comments/:commentId/like-status DISLIKE then NONE success', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.put(`${RoutesList.COMMENTS}/${comment.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatuses.DISLIKE })
      .expect(HttpStatusCode.NO_CONTENT_204)
    await request.put(`${RoutesList.COMMENTS}/${comment.id}/like-status`)
      .auth(accessToken, { type: 'bearer' })
      .send({ likeStatus: LikeStatuses.NONE })
      .expect(HttpStatusCode.NO_CONTENT_204)
    const result = await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.OK_200)
    const resultMyStatus = await request.get(`${RoutesList.COMMENTS}/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.OK_200)

    expect(result.body.id).toBe(comment.id)
    expect(result.body.likesInfo.likesCount).toBe(0)
    expect(result.body.likesInfo.dislikesCount).toBe(0)
    expect(result.body.likesInfo.myStatus).toBe(LikeStatuses.NONE)
    expect(resultMyStatus.body.likesInfo.myStatus).toBe(LikeStatuses.NONE)
  })

  it('DELETE /comments/:commentId success', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.delete(`${RoutesList.COMMENTS}/${comment.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.NO_CONTENT_204)

    await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.NOT_FOUND_404)
  })

  it('DELETE /comments/:commentId failed::notFound', async () => {
    const { comment, accessToken } = await postsTestManager.createComment()
    await request.delete(`${RoutesList.COMMENTS}/123456789012345678901234`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatusCode.NOT_FOUND_404)

    await request.get(`${RoutesList.COMMENTS}/${comment.id}`).expect(HttpStatusCode.OK_200)
  })
})

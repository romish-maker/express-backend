import { PostDbModel } from '../types/PostDbModel'
import { WithId } from 'mongodb'
import { PostViewModel } from '../types/PostViewModel'
import { BlogDbModel, BlogViewModel } from '../../../blogs'
import { LikesDbModel, LikeStatuses } from '../../../comments'

export class PostsMappers {
  mapDbPostsIntoView(dbPosts: WithId<PostDbModel>, likeStatus: LikesDbModel | null, lastThreeLikes: LikesDbModel[] | null): PostViewModel {
    return {
      id: dbPosts._id.toString(),
      title: dbPosts.title,
      shortDescription: dbPosts.shortDescription,
      content: dbPosts.content,
      blogId: dbPosts.blogId,
      blogName: dbPosts.blogName,
      createdAt: dbPosts.createdAt,
      extendedLikesInfo: {
        likesCount: dbPosts.likesCount,
        dislikesCount: dbPosts.dislikesCount,
        myStatus: likeStatus?.status ?? LikeStatuses.NONE,
        newestLikes: lastThreeLikes
          ? lastThreeLikes.map((like) => ({ addedAt: like.createdAt.toISOString(), userId: like.userId, login: like.userLogin }))
          : []
      }
    }
  }
  mapPostBlogToView(blogFromDb: WithId<BlogDbModel>): BlogViewModel {
    return {
      id: blogFromDb._id.toString(),
      name: blogFromDb.name,
      description: blogFromDb.description,
      websiteUrl: blogFromDb.websiteUrl,
      createdAt: blogFromDb.createdAt,
      isMembership: blogFromDb.isMembership,
    }
  }
}

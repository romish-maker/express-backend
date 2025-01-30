export type PostInputModel = {
  /**
   * maxLength: 30
   */
  title: string
  /**
   * maxLength: 100
   */
  shortDescription: string
  /**
   * maxLength: 1000
   */
  content: string
  /**
   * should be an existing blog id
   */
  blogId: string
  likesCount?: number
  dislikesCount?: number
}

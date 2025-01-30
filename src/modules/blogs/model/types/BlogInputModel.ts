export type BlogInputModel = {
  /**
   * max length 15
   */
  name: string
  /**
   * max length 500
   */
  description: string
  /**
   * max length 100
   * pattern: ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
   */
  websiteUrl: string
}

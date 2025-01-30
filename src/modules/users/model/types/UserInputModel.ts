export type UserInputModel = {
  /**
   * maxLength 10
   * minLength 3
   * pattern ^[a-zA-Z0-9_-]*$
   */
  login: string
  /**
   * maxLength 20
   * minLength 6
   */
  password: string
  /**
   * pattern: ^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$
   */
  email: string
}

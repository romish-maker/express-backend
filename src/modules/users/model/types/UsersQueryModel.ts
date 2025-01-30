import { PaginationAndSortQuery } from '../../../common/types'

export type UsersQueryModel = PaginationAndSortQuery<string> & {
  /**
   * default: null
   */
  searchLoginTerm?: string
  /**
   * default: null
   */
  searchEmailTerm?: string
}

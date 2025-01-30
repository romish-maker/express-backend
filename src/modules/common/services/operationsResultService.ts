import { ResultToRouterStatus } from '../enums/ResultToRouterStatus'
import { ResultToRouter } from '../types'

export const operationsResultService = {
  generateResponse<T = null>(status: ResultToRouterStatus, data?: T, errorMessage?: string): ResultToRouter<T> {
    return {
      status,
      data: data ?? null,
      errorMessage,
    }
  }
}

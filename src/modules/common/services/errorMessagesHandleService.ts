type ErrorMessageData = {
  message: string
  field: string
}

export type ErrorMessageHandleResult = { errorsMessages: ErrorMessageData[] }

export const errorMessagesHandleService = (errorMessageData: ErrorMessageData): ErrorMessageHandleResult => {
  return {
    errorsMessages: [
      {
        message: errorMessageData.message,
        field: errorMessageData.field,
      },
    ],
  }
}

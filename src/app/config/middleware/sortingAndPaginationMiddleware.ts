import { query } from "express-validator"

const pageNumberValidation = query("pageNumber").toInt().default(1)
const pageSize = query("pageSize").toInt().default(10)
const sortBy = query("sortBy").default("createdAt")
const sortDirection = query("sortDirection").matches(/^(desc|asc)$/).default("desc")

export const sortingAndPaginationMiddleware = () => [ pageNumberValidation, pageSize, sortBy, sortDirection ]

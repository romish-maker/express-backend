export const getRefreshTokenFromResponseCookies = (cookies: string[]) => {
  const refreshCookie = cookies.find((cookie: string) => cookie.includes('refreshToken'))

  return refreshCookie?.slice(13)?.split(';')?.[0] ?? null
}

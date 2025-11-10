export const redisTempMailKey = (mail: string) => `temp-mail:${mail}`;
export const redisRefreshTokenKey = (refreshToken: string) => `refresh:${refreshToken}`;

import { TJWTPayload } from './jwt-payload.type';

export type TJwtPayloadWithRt = TJWTPayload & { refreshToken: string };

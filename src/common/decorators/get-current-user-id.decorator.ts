import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJWTPayload } from 'modules/auth/types';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as TJWTPayload;
    return user.sub;
  },
);

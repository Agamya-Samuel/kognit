import { SetMetadata } from '@nestjs/common';

/** Mark an endpoint as public (bypasses JWT guard) */
export const Public = () => SetMetadata('isPublic', true);

/** Restrict endpoint to specific roles */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/** Require authentication (explicit marker, also handled by JwtAuthGuard by default) */
export const RequireAuth = () => SetMetadata('isPublic', false);

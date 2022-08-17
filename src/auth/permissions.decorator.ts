import { SetMetadata } from '@nestjs/common';
import { Permission } from './permission.enum';

export const Permissions_KEY = 'Permissions';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(Permissions_KEY, permissions);

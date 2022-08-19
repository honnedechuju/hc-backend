import { Permission } from './permission.enum';
import { Role } from './role.enum';

export default interface JwtPayload {
  id: string;
  username: string;
  role: Role;
  permissions: Permission[];
}

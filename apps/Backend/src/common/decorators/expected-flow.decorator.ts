import { SetMetadata } from '@nestjs/common';
import { RoleCategory } from '../../shared/auth/role-resolver.service';

export const EXPECTED_FLOW_KEY = 'expectedFlow';

export const ExpectedFlow = (flow: RoleCategory) => SetMetadata(EXPECTED_FLOW_KEY, flow);
// Unique owner_id generator for Phase 8 E2E (per WO-304.1.a).
// Each test calls newOwnerId() in beforeEach so concurrent test rows
// never collide. Pairs with helpers/db.js deleteByOwner() in afterEach.

import { randomUUID } from 'node:crypto';

export function newOwnerId() {
  return randomUUID();
}

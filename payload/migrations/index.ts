import * as migration_20260917_100736_baseline from './20260917_100736_baseline';
import * as migration_20260917_101344_calendar_collections from './20260917_101344_calendar_collections';
import * as removeReviewTargets from '@/payload/migrations/20260928-remove-review-targets';

export const migrations = [
  {
    up: migration_20260917_100736_baseline.up,
    down: migration_20260917_100736_baseline.down,
    name: '20260917_100736_baseline',
  },
  {
    up: migration_20260917_101344_calendar_collections.up,
    down: migration_20260917_101344_calendar_collections.down,
    name: '20260917_101344_calendar_collections'
  },
  {
    up: removeReviewTargets.up,
    down: removeReviewTargets.down,
    name: '20260928-remove-review-targets',
  },
];

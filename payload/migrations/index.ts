import * as migration_20260917_100736_baseline from './20260917_100736_baseline';
import * as migration_20260917_101344_calendar_collections from './20260917_101344_calendar_collections';
import * as migration_20260928_remove_review_targets from './20260928-remove-review-targets';
import * as migration_20260929_091058_ai_review_jobs from './20260929_091058_ai_review_jobs';

export const migrations = [
  {
    up: migration_20260917_100736_baseline.up,
    down: migration_20260917_100736_baseline.down,
    name: '20260917_100736_baseline',
  },
  {
    up: migration_20260917_101344_calendar_collections.up,
    down: migration_20260917_101344_calendar_collections.down,
    name: '20260917_101344_calendar_collections',
  },
  {
    up: migration_20260928_remove_review_targets.up,
    down: migration_20260928_remove_review_targets.down,
    name: '20260928-remove-review-targets',
  },
  {
    up: migration_20260929_091058_ai_review_jobs.up,
    down: migration_20260929_091058_ai_review_jobs.down,
    name: '20260929_091058_ai_review_jobs'
  },
];

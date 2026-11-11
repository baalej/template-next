import * as migration_20261111_132209_initial from './20261111_132209_initial';

export const migrations = [
  {
    up: migration_20261111_132209_initial.up,
    down: migration_20261111_132209_initial.down,
    name: '20261111_132209_initial',
  },
];

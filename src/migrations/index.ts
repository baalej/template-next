import * as migration_20261111_132209_initial from './20261111_132209_initial';
import * as migration_20261111_141835_payload_3_93 from './20261111_141835_payload_3_93';

export const migrations = [
  {
    up: migration_20261111_132209_initial.up,
    down: migration_20261111_132209_initial.down,
    name: '20261111_132209_initial',
  },
  {
    up: migration_20261111_141835_payload_3_93.up,
    down: migration_20261111_141835_payload_3_93.down,
    name: '20261111_141835_payload_3_93'
  },
];

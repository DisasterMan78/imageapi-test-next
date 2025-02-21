import { TextDecoder, TextEncoder } from 'util';
import { expect } from '@jest/globals';
import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const toMatchImageSnapshot = configureToMatchImageSnapshot({
  failureThresholdType: 'pixel',
  customSnapshotsDir: `${__dirname}/test/snapshots/`,
});

// extend Jest expect
expect.extend({ toMatchImageSnapshot });

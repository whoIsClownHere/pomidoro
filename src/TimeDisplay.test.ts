import { describe, expect, it } from 'vitest';
import { parseTime } from './TimeDisplay';

const MIN = 60_000;
describe('parseTime', () => {
  it('reads plain minutes', () => expect(parseTime('45')).toBe(45 * MIN));
  it('reads mm:ss', () => expect(parseTime('4:30')).toBe(4.5 * MIN));
  it('reads h:mm:ss', () => expect(parseTime('1:15:00')).toBe(75 * MIN));
  it('accepts a dot and spaces', () => expect(parseTime(' 25.00 ')).toBe(25 * MIN));
  it('rejects junk and out-of-range', () => {
    for (const bad of ['', 'abc', '12:75', '0', '0:00', '6:00:00', '1:2:3:4']) expect(parseTime(bad)).toBeNull();
  });
});

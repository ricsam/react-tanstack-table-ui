import { describe, it, expect } from 'vitest';
import { VirtualHeaderGroupCache } from './virtual_header_group_cache';
import { VirtualHeader } from "../virtual_header/types";
import { VirtualHeaderGroup } from '../header_group';

// Helpers to create dummy headers and groups.
function createHeader(headerId: string, width: number, isPinned: any = null): VirtualHeader {
  return {
    headerId,
    width,
    isPinned,
    isDragging: false,
    headerIndex: 0,
    dndStyle: { color: 'red' },
  };
}

function createGroup(
  id: string,
  offsetLeft: number,
  offsetRight: number,
  headerGroup: any,
  headers: VirtualHeader[]
): VirtualHeaderGroup {
  return {
    id,
    offsetLeft,
    offsetRight,
    headerGroup,
    headers,
  };
}

describe('VirtualHeaderGroupCache', () => {
  it('should return the same array if nothing changed', () => {
    const cache = new VirtualHeaderGroupCache();

    // Create initial header group with two headers.
    const headerA = createHeader('A', 100, 'left');
    const headerB = createHeader('B', 150, 'right');
    const group1 = createGroup('group1', 0, 100, 'group1', [headerA, headerB]);
    const groups = [group1];

    // First update caches the group.
    const result1 = cache.update(groups);

    // Create a new value-equal set of headers and group.
    const headerA2 = createHeader('A', 100, 'left');
    const headerB2 = createHeader('B', 150, 'right');
    const group1Copy = createGroup('group1', 0, 100, 'group1', [headerA2, headerB2]);
    const result2 = cache.update([group1Copy]);

    // Nothing has changed so the cached array should be returned.
    expect(result2).toBe(result1);
  });

  it('should update group if a scalar property changes', () => {
    const cache = new VirtualHeaderGroupCache();

    const headerA = createHeader('A', 100, 'left');
    const headerB = createHeader('B', 150, 'right');
    const group1 = createGroup('group1', 0, 100, 'group1', [headerA, headerB]);
    const groups = [group1];

    const result1 = cache.update(groups);

    // Change a scalar property (offsetLeft) of the group.
    const headerA2 = createHeader('A', 100, 'left'); // headers remain the same
    const headerB2 = createHeader('B', 150, 'right');
    const group1Modified = createGroup('group1', 10, 100, 'group1', [headerA2, headerB2]);
    const result2 = cache.update([group1Modified]);

    // The group object should be new due to the scalar change.
    expect(result2[0]).not.toBe(result1[0]);
    // But the headers inside should be reused (cached).
    expect(result2[0].headers[0]).toBe(result1[0].headers[0]);
    expect(result2[0].headers[1]).toBe(result1[0].headers[1]);
  });

  it('should update header if a header property changes', () => {
    const cache = new VirtualHeaderGroupCache();

    const headerA = createHeader('A', 100, 'left');
    const headerB = createHeader('B', 150, 'right');
    const group1 = createGroup('group1', 0, 100, 'group1', [headerA, headerB]);
    const groups = [group1];

    const result1 = cache.update(groups);

    // Now update header A (change its width) while header B remains unchanged.
    const headerAChanged = createHeader('A', 200, 'left'); // width updated
    const headerB2 = createHeader('B', 150, 'right');
    const group1Modified = createGroup('group1', 0, 100, 'group1', [headerAChanged, headerB2]);
    const result2 = cache.update([group1Modified]);

    // The group object is new due to the header change.
    expect(result2[0]).not.toBe(result1[0]);
    // Header A should be updated.
    expect(result2[0].headers[0]).not.toBe(result1[0].headers[0]);
    // Header B should be reused.
    expect(result2[0].headers[1]).toBe(result1[0].headers[1]);
  });

  it('should update header array ordering', () => {
    const cache = new VirtualHeaderGroupCache();

    // Create a group with headers A, B, and C.
    const headerA = createHeader('A', 100, 'left');
    const headerB = createHeader('B', 150, 'right');
    const headerC = createHeader('C', 120, null);
    const group1 = createGroup('group1', 0, 100, 'group1', [headerA, headerB, headerC]);
    const groups = [group1];

    const result1 = cache.update(groups);

    // Update ordering: remove A, reorder to [B, C, D] with a new header D.
    const headerB2 = createHeader('B', 150, 'right'); // identical values; should be replaced by cached header.
    const headerC2 = createHeader('C', 120, null);
    const headerD = createHeader('D', 130, 'left');
    const group1Modified = createGroup('group1', 0, 100, 'group1', [headerB2, headerC2, headerD]);
    const result2 = cache.update([group1Modified]);

    // The group is new because the ordering changed.
    expect(result2[0]).not.toBe(result1[0]);

    // Header B and C should be reused from cache.
    const cachedB = result1[0].headers.find(h => h.headerId === 'B');
    const cachedC = result1[0].headers.find(h => h.headerId === 'C');
    expect(result2[0].headers[0]).toBe(cachedB);
    expect(result2[0].headers[1]).toBe(cachedC);

    // Header D is new.
    expect(result2[0].headers[2].headerId).toBe('D');
  });
});

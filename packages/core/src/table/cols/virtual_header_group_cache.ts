import { VirtualHeader } from "./virtual_header/types";
import { VirtualHeaderGroup } from "./header_group";
import { TableState } from "@tanstack/react-table";
// Helper for shallow equality on objects (for dndStyle)
function shallowEqual(
  objA: any,
  objB: any,
  excludeKeys?: string | string[],
): boolean {
  if (objA === objB) return true;
  if (!objA || !objB || typeof objA !== "object" || typeof objB !== "object")
    return false;

  // Convert single key to array for consistent handling
  const excludeKeysArr = excludeKeys
    ? Array.isArray(excludeKeys)
      ? excludeKeys
      : [excludeKeys]
    : [];

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  // Filter out excluded keys for length comparison
  const filteredKeysA = keysA.filter((key) => !excludeKeysArr.includes(key));
  const filteredKeysB = keysB.filter((key) => !excludeKeysArr.includes(key));

  if (filteredKeysA.length !== filteredKeysB.length) return false;

  // Only compare non-excluded keys
  for (const key of filteredKeysA) {
    if (objA[key] !== objB[key]) return false;
  }

  return true;
}

export class VirtualHeaderGroupCache {
  // Cache for header groups keyed by group.id
  private groupCache = new Map<string, VirtualHeaderGroup>();
  // Cache for overall result array (if nothing changed, we can return the same reference)
  private lastResult: VirtualHeaderGroup[] | null = null;

  private prevState: TableState | null = null;

  /**
   * Updates the cache with the new header groups.
   * If nothing changes, returns the same array reference.
   * For each header group, only headers that have actually updated are new objects.
   */
  public update(
    newGroups: VirtualHeaderGroup[],
    state: TableState,
  ): VirtualHeaderGroup[] {
    let changed = false;

    const prevState = this.prevState;
    this.prevState = state;

    const updatedGroups = newGroups.map((newGroup) => {
      const cachedGroup = this.groupCache.get(newGroup.id);
      // If no cached group, cache the new one immediately.
      if (!cachedGroup) {
        this.groupCache.set(newGroup.id, newGroup);
        changed = true;
        return newGroup;
      }

      // Check if any of the group's scalar properties have changed.
      let groupChanged =
        cachedGroup.offsetLeft !== newGroup.offsetLeft ||
        cachedGroup.offsetRight !== newGroup.offsetRight ||
        cachedGroup.headerGroup !== newGroup.headerGroup ||
        cachedGroup.headers.length !== newGroup.headers.length;

      // Build a lookup of the cached headers keyed by headerId.
      const cachedHeaderMap = new Map<string, VirtualHeader>();
      cachedGroup.headers.forEach((h) => cachedHeaderMap.set(h.headerId, h));

      // Process headers: if a header exists and its properties are the same, reuse it.
      let headersChanged = false;
      const newHeadersMapped = newGroup.headers.map((newHeader) => {
        const cachedHeader = cachedHeaderMap.get(newHeader.headerId);

        if (
          cachedHeader &&
          prevState &&
          shallowEqual(cachedHeader, newHeader, ["dndStyle"]) &&
          shallowEqual(cachedHeader.dndStyle, newHeader.dndStyle) &&
          // prevState is the same as the current state
          (prevState.columnSizingInfo.isResizingColumn ===
            state.columnSizingInfo.isResizingColumn ||
            // or it is resizing, but this is not the column that is being resized (shallow equal check previously ensures that the headerId is the same)
            (prevState.columnSizingInfo.isResizingColumn !==
              cachedHeader.headerId &&
              state.columnSizingInfo.isResizingColumn !== newHeader.headerId))
        ) {
          // Reuse cached header
          return cachedHeader;
        }
        // Otherwise, mark that headers have changed and use the new header.
        headersChanged = true;
        return newHeader;
      });

      // Check ordering: if the new header array isn't in the same order as before, treat as changed.
      let sameOrder = true;
      if (cachedGroup.headers.length === newHeadersMapped.length) {
        for (let i = 0; i < cachedGroup.headers.length; i++) {
          if (cachedGroup.headers[i] !== newHeadersMapped[i]) {
            sameOrder = false;
            break;
          }
        }
      } else {
        sameOrder = false;
      }

      // Final headers: if nothing changed (including order), reuse the cached headers array.
      const finalHeaders = sameOrder ? cachedGroup.headers : newHeadersMapped;
      if (headersChanged || !sameOrder) {
        groupChanged = true;
      }

      if (groupChanged) {
        // Create a new group object that uses the possibly updated headers.
        const updatedGroup: VirtualHeaderGroup = {
          ...newGroup,
          headers: finalHeaders,
        };
        this.groupCache.set(newGroup.id, updatedGroup);
        changed = true;
        return updatedGroup;
      }
      // No change for this group: return the cached object.
      return cachedGroup;
    });

    if (!changed && this.lastResult) {
      if (updatedGroups.length !== this.lastResult.length) {
        changed = true;
      } else {
        for (let i = 0; i < updatedGroups.length; i++) {
          if (updatedGroups[i] !== this.lastResult[i]) {
            changed = true;
            break;
          }
        }
      }
    }
    // If nothing changed overall, return the same array reference.
    if (!changed && this.lastResult) {
      return this.lastResult;
    }
    this.lastResult = updatedGroups;
    return updatedGroups;
  }
}

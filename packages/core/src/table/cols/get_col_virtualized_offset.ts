import { VirtualHeader } from "./virtual_header/types";

/**
 * when we are only rendering a window of columns while maintaining a scrollbar we need to move the elements as we remove elements to the left
 * we are assuming that the columns are rendered in order, so pinned left, followed by non-pinned, followed by pinned right
 */
export function getColVirtualizedOffsets({
  headers,
  totalSize,
}: {
  headers: VirtualHeader[];
  totalSize: number;
}) {
  let offsetLeft = 0;
  let offsetRight = 0;

  {
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = 0; i < headers.length; i++) {
      const vc = headers[i];
      if (vc.isPinned === "start" && vc.header) {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    if (typeof firstNonPinned !== "undefined") {
      offsetLeft = headers[firstNonPinned].start
      if (typeof lastPinned !== "undefined") {
        offsetLeft -= headers[lastPinned].end;
      }
    }
  }
  {
    // from right to left
    let lastPinned: undefined | number;
    let firstNonPinned: undefined | number;
    for (let i = headers.length - 1; i >= 0; i--) {
      const vc = headers[i];
      if (!vc) {
        console.log(vc, headers, i);
      }
      if (vc.isPinned === "end") {
        lastPinned = i;
      } else {
        firstNonPinned = i;
        break;
      }
    }

    // a,b, , , , , ,c,d // pinned
    // a,b,c,d,e,f,g,h,i // window
    // offsetRight should be 0 because c.start - g.start = 0
    // g = firstNonPinned
    // c = lastPinned
    // lastPinned.start - firstNonPinned.end

    // in this scenario we have no pinned, first nonPinned will be i, and size - firstNonPinned.end = 0
    // a,b,c,d,e,f,g,h,i

    // in this scneario we have scrolled a bit
    //      |               |
    // a,b,c,d,e,f,g,h,i,j,k,l,m
    // firstNonPinned = is k, we must have an offsetRight of size - k.end

    // in this scneario we have scrolled a bit, and we have pinned
    //      |            a,b|     // pinned
    // a,b,c,d,e,f,g,h,i,j,k,l,m  // non-pinned
    // firstNonPinned = i
    // lastPinned = a
    // a.start - i.end

    if (typeof firstNonPinned !== "undefined") {
      offsetRight = totalSize - headers[firstNonPinned].end;
      if (typeof lastPinned !== "undefined") {
        offsetRight =
          headers[lastPinned].start - headers[firstNonPinned].end;
      }
    }
  }
  return { offsetLeft, offsetRight };
}

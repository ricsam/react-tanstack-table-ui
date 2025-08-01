/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  CellContext,
  ColumnHelper,
  HeaderContext,
  ColumnDef,
} from "@tanstack/react-table";

export type HeaderDecorator = (
  original: React.ReactNode,
  props: HeaderContext<any, any>,
) => React.ReactNode;
export type CellDecorator = (
  original: React.ReactNode,
  props: CellContext<any, any>,
) => React.ReactNode;

export const decorateColumnHelper = <T,>(
  columnHelper: ColumnHelper<T>,
  decorators: {
    header?: HeaderDecorator;
    footer?: HeaderDecorator;
    cell?: CellDecorator;
    filter?: () => React.ReactNode;
    extraHeaders?: ColumnDef<T, any>[];
  },
): ColumnHelper<T> => {
  const originalColumnHelper = columnHelper as ColumnHelper<any>;

  const newColumnHelper = {
    ...columnHelper,
  } as ColumnHelper<any>;

  const hasFilter = !!decorators.filter;

  for (const _key of ["accessor", "display", "group"] as const) {
    const key = _key as "accessor"; // or "display" or "group"
    newColumnHelper[key] = (...args) => {
      const col = originalColumnHelper[key](...args);
      for (const [_key, _decorator] of Object.entries(decorators)) {
        if (_key === "filter" || _key === "spreadsheetHeader") {
          continue;
        }
        const key = _key as "cell"; // or "header" or "footer" or "cell"
        const decorator = _decorator as CellDecorator; // or CellDecorator
        let origRenderFn: string | Function | undefined = col[key];
        if (key === "cell" && !origRenderFn) {
          origRenderFn = (props: CellContext<any, any>) => props.getValue();
        }
        if (origRenderFn) {
          col[key] = (props) => {
            const result = decorator(
              typeof origRenderFn === "function"
                ? origRenderFn(props)
                : origRenderFn,
              props,
            );
            return result;
          };
        }
      }

      let newCol: any = { ...col };

      if (hasFilter) {
        newCol = {
          ...col,
        };
        const leafColumns: any[] = [];
        const iter = (parent: any) => {
          if (!parent.columns) {
            leafColumns.push(parent);
          }
          for (const col of parent?.columns ?? []) {
            iter(col);
          }
        };
        iter(newCol);
        leafColumns.forEach((col) => {
          if (col.id?.includes("_decorator_filter_")) {
            return;
          }
          const filterCol = {
            ...col,
            id: "_decorator_filter_" + (col.id ?? "unknown_col"),
            header: () => decorators.filter?.(),
            footer: undefined,
          };
          col.columns = [filterCol];
        });
      }

      if (decorators.extraHeaders) {
        decorators.extraHeaders.forEach((extraHeader, index) => {
          const leafColumns: any[] = [];
          const iter = (parent: any) => {
            if (!parent.columns) {
              leafColumns.push(parent);
            }
            for (const col of parent?.columns ?? []) {
              iter(col);
            }
          };
          iter(newCol);
          leafColumns.forEach((col) => {
            if (col.id?.includes(`_decorator_extra_header_${index}_`)) {
              return;
            }
            const extraHeaderCol: ColumnDef<T, any> = {
              ...col,
              ...extraHeader,
              meta: {
                ...col.meta,
                ...extraHeader.meta,
              },
              id: `_decorator_extra_header_${index}_${col.id ?? "unknown_col"}`,
            };
            col.columns = [extraHeaderCol];
          });
        });
      }

      return newCol;
    };
  }

  return newColumnHelper;
};

export const getColumnDefIds = (col: ColumnDef<any>): string[] => {
  let childIds: string[] = [];
  if ('columns' in col && col.columns) {
    childIds = col.columns.flatMap((col) => getColumnDefIds(col));
  }
  if (col.id) {
    return [col.id, ...childIds];
  }
  return childIds;
};
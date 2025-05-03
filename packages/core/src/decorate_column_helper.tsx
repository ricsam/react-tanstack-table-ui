import {
  CellContext,
  ColumnHelper,
  HeaderContext,
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
        if (_key === "filter") {
          continue;
        }
        const key = _key as "header"; // or "footer" or "cell"
        const decorator = _decorator as HeaderDecorator; // or CellDecorator
        const origRenderFn = col[key];
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

      if (hasFilter) {
        const columnWithFilter: any = {
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
        iter(columnWithFilter);
        leafColumns.forEach((col) => {
          if (col.id.startsWith("_decorator_filter_")) {
            return;
          }
          const filterCol = {
            ...col,
            id: "_decorator_filter_" + col.id,
            header: () => decorators.filter?.(),
          };
          col.columns = [filterCol];
        });
        return columnWithFilter;
      }

      return col;
    };
  }

  return newColumnHelper;
};

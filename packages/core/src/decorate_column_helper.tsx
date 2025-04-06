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
  },
): ColumnHelper<T> => {
  const originalColumnHelper = columnHelper as ColumnHelper<any>;

  const newColumnHelper = {
    ...columnHelper,
  } as ColumnHelper<any>;

  for (const _key of ["accessor", "display", "group"] as const) {
    const key = _key as "accessor"; // or "display" or "group"
    newColumnHelper[key] = (...args) => {
      const col = originalColumnHelper[key](...args);
      for (const [_key, _decorator] of Object.entries(decorators)) {
        const key = _key as "header"; // or "footer" or "cell"
        const decorator = _decorator as HeaderDecorator; // or CellDecorator
        const origRenderFn = col[key];
        if (origRenderFn) {
          col[key] = (props) =>
            decorator(
              typeof origRenderFn === "function"
                ? origRenderFn(props)
                : origRenderFn,
              props,
            );
        }
      }
      return col;
    };
  }

  return newColumnHelper;
};

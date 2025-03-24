export type RowDndHandler<T> = {
  getGroup: (row: T) => string | undefined;
  rootGroup: string;
  updateSubRows?: (row: T, newSubRows: T[]) => T;
  updateData: (newData: T[]) => void;
};

export type ColDndHandler<T> = {
  updateColumns?: (newColumns: T[]) => T;
};

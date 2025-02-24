import { describe, expect, it } from "vitest";
import { arrayMove, groupedArrayMove } from "./array_move";

describe("can move", () => {
  it("should move positive delta", () => {
    const arr = ["a", "b", "c", "d", "e", "f", "g"];
    const result = arrayMove({
      arr,
      selected: ["c", "e"],
      delta: 2,
      getIndex: (item) => arr.indexOf(item),
    });
    expect(result).toEqual(["a", "b", "d", "f", "c", "g", "e"]);
  });
  it("should move with negative delta", () => {
    const arr = ["a", "b", "c", "d", "e", "f", "g"];
    const result = arrayMove({
      arr,
      selected: ["c", "e"],
      delta: -2,
      getIndex: (item) => arr.indexOf(item),
    });
    expect(result).toEqual(["c", "a", "e", "b", "d", "f", "g"]);
  });
});
describe("can clamp", () => {
  it("should move positive delta", () => {
    const arr = ["a", "b", "c", "d", "e", "f", "g"];
    const result = arrayMove({
      arr,
      selected: ["c", "e"],
      delta: 5,
      getIndex: (item) => arr.indexOf(item),
    });
    expect(result).toEqual(["a", "b", "d", "f", "g", "c", "e"]);
  });
  it("should move with negative delta", () => {
    const arr = ["a", "b", "c", "d", "e", "f", "g"];
    const result = arrayMove({
      arr,
      selected: ["c", "e"],
      delta: -2,
      getIndex: (item) => arr.indexOf(item),
    });
    expect(result).toEqual(["c", "a", "e", "b", "d", "f", "g"]);
  });
});

describe("grouped move", () => {
  it("can do a grouped move", () => {
    type Item = { val: string; children: Item[] };
    const createItem = (val: string, children?: Item[]): Item => {
      const item = {
        val,
        children: children || [],
        parent: null,
      };
      return item;
    };

    const data = [
      createItem("a"),
      createItem("b"),
      createItem(
        "c",
        ["h", "i"].map((val) => createItem(val)),
      ),
      createItem("d"),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ];

    const items = groupedArrayMove({
      originalData: data,
      flatSelected: ["i"], // i
      delta: -3,
      getExpanded(row) {
        return true;
      },
      getSubRows(row) {
        return row.children;
      },
      getGroup(row) {
        return "root";
      },
      getId(row) {
        return row.val;
      },
      updateSubRows(row, newSubRows) {
        return { ...row, children: newSubRows };
      },
      rootGroup: "root",
    });
    // a,b,c,h,i,d,e,f,g
    // a,b,c,h,i,d,e,f,g
    //   |-----|
    //      -3
    expect(items).toEqual([
      createItem("a"),
      createItem("i"),
      createItem("b"),
      createItem(
        "c",
        ["h"].map((val) => createItem(val)),
      ),
      createItem("d"),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ]);
  });
  it("can do a basic move", () => {
    type Item = { val: string; children: Item[] };
    const createItem = (val: string, children?: Item[]): Item => {
      const item = {
        val,
        children: children || [],
        parent: null,
      };
      return item;
    };

    const data = [
      createItem("a"),
      createItem("b"),
      createItem("c"),
      createItem("d"),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ];

    const items = groupedArrayMove({
      originalData: data,
      flatSelected: ["b"], // i
      delta: 2,
      getSubRows(row) {
        return row.children;
      },
      getExpanded(row) {
        return true;
      },
      getGroup(row) {
        return "root";
      },
      getId(row) {
        return row.val;
      },
      updateSubRows(row, newSubRows) {
        return { ...row, children: newSubRows };
      },
      rootGroup: "root",
    });
    // a,b,c,d,e,f,g
    //   |---|
    //      +2
    // a,c,d,b,e,f,g
    expect(items).toEqual([
      createItem("a"),
      createItem("c"),
      createItem("d"),
      createItem("b"),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ]);
  });
  it("can move item with children", () => {
    type Item = { val: string; children: Item[] };
    const createItem = (val: string, children?: Item[]): Item => {
      const item = {
        val,
        children: children || [],
        parent: null,
      };
      return item;
    };

    const data = [
      createItem("a"),
      createItem("b"),
      createItem(
        "c",
        ["h", "i"].map((val) => createItem(val)),
      ),
      createItem("d"),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ];

    const items = groupedArrayMove({
      originalData: data,
      flatSelected: ["c"],
      delta: 1,
      getExpanded(row) {
        return false;
      },
      getSubRows(row) {
        return row.children;
      },
      getGroup(row) {
        return "root";
      },
      getId(row) {
        return row.val;
      },
      updateSubRows(row, newSubRows) {
        return { ...row, children: newSubRows };
      },
      rootGroup: "root",
    });
    // a,b,c,h,i,d,e,f,g
    // a,b,c,h,i,d,e,f,g
    //   |-----|
    //      -3
    expect(items).toEqual([
      createItem("a"),
      createItem("b"),
      createItem("d"),
      createItem(
        "c",
        ["h", "i"].map((val) => createItem(val)),
      ),
      createItem("e"),
      createItem("f"),
      createItem("g"),
    ]);
  });
  it("can perform a real example", () => {
    type SmallData = {
      id: string;
      firstName: string;
      lastName: string;
      children: SmallData[];
    };

    const data: SmallData[] = [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        children: [],
      },
      {
        id: "2",
        firstName: "Jane",
        lastName: "Doe",
        children: [],
      },
      {
        id: "3",
        firstName: "Jim",
        lastName: "Smith",
        children: [],
      },
      {
        id: "4",
        firstName: "Jill",
        lastName: "Smith",
        children: [],
      },
      {
        id: "5",
        firstName: "Jack",
        lastName: "Brown",
        children: [],
      },
    ];
    expect(
      groupedArrayMove({
        originalData: data,
        flatSelected: [],
        delta: 1,
        rootGroup: "root",
        getSubRows: (row) => row.children,
        getGroup: (row) => "root",
        getId: (row) => row.id,
        updateSubRows: (row, newSubRows) => ({ ...row, children: newSubRows }),
        getExpanded(row) {
          return true;
        },
      }),
    );
  });
});

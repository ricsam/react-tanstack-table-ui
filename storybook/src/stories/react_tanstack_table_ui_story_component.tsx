import {
  ScopedCssBaseline,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as core from "@rttui/core";
import {
  CellAvatarProps,
  CellAvatarWithTextProps,
  CellBadgeProps,
  CellCurrencyProps,
  CellLinkProps,
  CellPercentProps,
  CellProps,
  decorateColumnHelper,
  lightModeVars as defaultLightModeVars,
  ReactTanstackTableUiProps,
  Skin,
  ReactTanstackTableUi as TableComponent,
  defaultSkin as theDefaultSkin,
} from "@rttui/core";
import * as anoccaSkin from "@rttui/skin-anocca";
import * as muiSkin from "@rttui/skin-mui";
import * as twskin from "@rttui/skin-tailwind";
import {
  ColumnDef,
  createColumnHelper,
  TableOptions,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import placeholderAvatar from "./placeholder_avatar.png";

import "@fontsource/inter";
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "./index.css";

const defaultSkin = {
  vars: defaultLightModeVars,
  skin: theDefaultSkin,
  ...core,
};

export type Person = {
  id: string;
  name: string;
  age: number;
  city: string;
} & Record<`col${number}`, string>;

const smallData: Person[] = [
  { id: "1", name: "John", age: 20, city: "New York" },
  { id: "2", name: "Jane", age: 21, city: "Los Angeles" },
  { id: "3", name: "Jim", age: 22, city: "Chicago" },
];

const bigData: Person[] = Array.from({ length: 1000 }, (_, i) => ({
  id: i.toString(),
  name: `Person ${i}`,
  age: 20 + i,
  city: `City ${i}`,
  ...Object.fromEntries(
    Array.from({ length: 100 }, (_, j) => [`col${j}`, `${i}-${j}`]),
  ),
}));

export const ReactTanstackTableUi = (
  props: {
    data: "big" | "small" | "none";
    columns: "many" | "few";
    columnDefs?: Record<
      string,
      Partial<ColumnDef<Person, unknown>> | undefined
    >;
    withTwoHeaderRows?: boolean;
    withHeaderGroups?: boolean;
    skin?: "skin-anocca" | "skin-tailwind" | "skin-mui" | "core";
  } & Omit<TableOptions<Person>, "data" | "columns"> &
    Omit<ReactTanstackTableUiProps<Person>, "table" | "skin">,
) => {
  const theme = useTheme();
  const data: Person[] =
    props.data === "big" ? bigData : props.data === "small" ? smallData : [];
  const skin = props.skin;
  let HeaderPinButtons: React.FC = defaultSkin.HeaderPinButtons;
  if (skin === "skin-mui") {
    HeaderPinButtons = muiSkin.HeaderPinButtons;
  } else if (skin === "skin-tailwind") {
    HeaderPinButtons = twskin.HeaderPinButtons;
  } else if (skin === "skin-anocca") {
    HeaderPinButtons = anoccaSkin.HeaderPinButtons;
  }

  let Resizer: React.FC = defaultSkin.Resizer;
  if (skin === "skin-mui") {
    Resizer = muiSkin.Resizer;
  } else if (skin === "skin-tailwind") {
    Resizer = twskin.Resizer;
  } else if (skin === "skin-anocca") {
    Resizer = anoccaSkin.Resizer;
  }

  let CellAvatar: React.FC<CellAvatarProps> = defaultSkin.CellAvatar;
  if (skin === "skin-mui") {
    CellAvatar = muiSkin.CellAvatar;
  } else if (skin === "skin-tailwind") {
    CellAvatar = twskin.CellAvatar;
  } else if (skin === "skin-anocca") {
    CellAvatar = anoccaSkin.CellAvatar;
  }

  let CellAvatarWithText: React.FC<CellAvatarWithTextProps> =
    defaultSkin.CellAvatarWithText;
  if (skin === "skin-mui") {
    CellAvatarWithText = muiSkin.CellAvatarWithText;
  } else if (skin === "skin-tailwind") {
    CellAvatarWithText = twskin.CellAvatarWithText;
  } else if (skin === "skin-anocca") {
    CellAvatarWithText = anoccaSkin.CellAvatarWithText;
  }

  let CellNumber: React.FC<{ children: React.ReactNode }> =
    defaultSkin.CellNumber;
  if (skin === "skin-mui") {
    CellNumber = muiSkin.CellNumber;
  } else if (skin === "skin-tailwind") {
    CellNumber = twskin.CellNumber;
  } else if (skin === "skin-anocca") {
    CellNumber = anoccaSkin.CellNumber;
  }

  let CellTag: React.FC<{ children: React.ReactNode }> = defaultSkin.CellTag;
  if (skin === "skin-mui") {
    CellTag = muiSkin.CellTag;
  } else if (skin === "skin-tailwind") {
    CellTag = twskin.CellTag;
  } else if (skin === "skin-anocca") {
    CellTag = anoccaSkin.CellTag;
  }

  let CellCurrency: React.FC<CellCurrencyProps> = defaultSkin.CellCurrency;

  if (skin === "skin-mui") {
    CellCurrency = muiSkin.CellCurrency;
  } else if (skin === "skin-tailwind") {
    CellCurrency = twskin.CellCurrency;
  } else if (skin === "skin-anocca") {
    CellCurrency = anoccaSkin.CellCurrency;
  }

  let CellBadge: React.FC<CellBadgeProps> = defaultSkin.CellBadge;
  if (skin === "skin-mui") {
    CellBadge = muiSkin.CellBadge;
  } else if (skin === "skin-tailwind") {
    CellBadge = twskin.CellBadge;
  } else if (skin === "skin-anocca") {
    CellBadge = anoccaSkin.CellBadge;
  }

  let Cell: React.FC<CellProps> = defaultSkin.Cell;
  if (skin === "skin-mui") {
    Cell = muiSkin.Cell;
  } else if (skin === "skin-tailwind") {
    Cell = twskin.Cell;
  } else if (skin === "skin-anocca") {
    Cell = anoccaSkin.Cell;
  }
  let CellLink: React.FC<CellLinkProps> = defaultSkin.CellLink;
  if (skin === "skin-mui") {
    CellLink = muiSkin.CellLink;
  } else if (skin === "skin-tailwind") {
    CellLink = twskin.CellLink;
  } else if (skin === "skin-anocca") {
    CellLink = anoccaSkin.CellLink;
  }

  let CellPercent: React.FC<CellPercentProps> = defaultSkin.CellPercent;
  if (skin === "skin-mui") {
    CellPercent = muiSkin.CellPercent;
  } else if (skin === "skin-tailwind") {
    CellPercent = twskin.CellPercent;
  } else if (skin === "skin-anocca") {
    CellPercent = anoccaSkin.CellPercent;
  }

  const columns: ColumnDef<Person, unknown>[] = React.useMemo(() => {
    const originalColumnHelper = createColumnHelper<Person>();
    const columnHelper = props.enableColumnPinning
      ? decorateColumnHelper(originalColumnHelper, {
          header: (original, info) => (
            <div style={{ display: "flex", gap: 2, flex: 1 }}>
              {original}
              {props.enableColumnPinning && info.column.id !== "selected" && (
                <>
                  <div style={{ flex: 1 }}></div>
                  <HeaderPinButtons />
                </>
              )}
              {props.enableColumnResizing && <Resizer />}
            </div>
          ),
          cell: (original) => {
            return <Cell>{original}</Cell>;
          },
        })
      : originalColumnHelper;

    const fewColumns: ColumnDef<Person, any>[] = [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (info) => (
          <Cell
            checkbox={!!props.enableRowSelection}
            expandButton={!!props.getExpandedRowModel}
            pinButtons={!!props.enableRowPinning}
            highlightSelected={!!props.enableRowSelection}
          >
            {info.getValue()}
          </Cell>
        ),
        ...props.columnDefs?.["name"],
      }),
      columnHelper.accessor("age", {
        id: "age",
        header: "Age",
        cell:
          skin === "skin-mui" || skin === "skin-anocca"
            ? (info) => (
                <Typography variant="body2">{info.getValue()}</Typography>
              )
            : (info) => <twskin.CellText>{info.getValue()}</twskin.CellText>,
        size: 50,
        ...props.columnDefs?.["age"],
      }),
      columnHelper.accessor("city", {
        id: "city",
        header: "City",
        cell:
          skin === "skin-mui" || skin === "skin-anocca"
            ? (info) => (
                <Typography variant="body2">{info.getValue()}</Typography>
              )
            : (info) => <twskin.CellText>{info.getValue()}</twskin.CellText>,
        ...props.columnDefs?.["city"],
      }),
    ];

    const specialColumns: ColumnDef<Person, unknown>[] = [
      columnHelper.display({
        id: "percent",
        header: "Percent",
        cell: () => {
          return <CellPercent value={0.5} />;
        },
      }),
      columnHelper.display({
        id: "link",
        header: "Link",
        cell: () => {
          return (
            <CellLink
              href="https://www.google.com"
              srText="Link to Google"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </CellLink>
          );
        },
      }),
      columnHelper.display({
        id: "avatar",
        header: "Avatar",
        cell: () => {
          return <CellAvatar src={placeholderAvatar} alt="Avatar" />;
        },
      }),
      columnHelper.display({
        id: "avatarWithText",
        header: "Avatar With Text",
        maxSize: 1000,
        cell: () => {
          return (
            <div style={{ flexShrink: 0 }}>
              <CellAvatarWithText
                src={placeholderAvatar}
                alt="Avatar"
                primary="John Doe"
                secondary="Software Engineer"
              />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "salary",
        header: "Salary",
        cell: () => {
          return <CellCurrency value={123} />;
        },
      }),
      columnHelper.display({
        id: "number_of_reports",
        header: "Number of Reports",
        cell: () => {
          return <CellNumber>123</CellNumber>;
        },
      }),
      columnHelper.display({
        id: "tag",
        header: "Tag",
        cell: () => {
          return <CellTag>Tag</CellTag>;
        },
      }),
      columnHelper.display({
        id: "badge",
        header: "Badge",
        cell: () => {
          return (
            <CellBadge color="indigo" bgColor="red">
              Badge
            </CellBadge>
          );
        },
      }),
    ];

    const manyColumns: ColumnDef<Person, any>[] = [
      ...fewColumns,
      ...specialColumns,
      ...Array.from({ length: 100 }, (_, i) =>
        columnHelper.accessor(`col${i}`, {
          id: `col${i}`,
          header: `Column ${i}`,
          cell:
            skin === "skin-mui" || skin === "skin-anocca"
              ? (info) => (
                  <Typography variant="body2">{info.getValue()}</Typography>
                )
              : (info) => <twskin.CellText>{info.getValue()}</twskin.CellText>,
        }),
      ),
    ];

    let cols = props.columns === "few" ? fewColumns : manyColumns;

    if (props.withHeaderGroups) {
      cols.splice(
        0,
        2,
        columnHelper.group({
          id: `personal-info`,
          header: "Personal Info",
          columns: cols.slice(0, 2),
        }),
      );
    }
    if (props.withTwoHeaderRows) {
      cols = cols.map((col) => {
        const newCol: ColumnDef<Person> | undefined = col.id
          ? {
              ...col,
              id: col.id,
              header: () =>
                skin === "skin-mui" || skin === "skin-anocca" ? (
                  <TextField
                    placeholder="Search..."
                    slotProps={{
                      input: { sx: { height: "20px", width: "150px" } },
                    }}
                  />
                ) : (
                  <div className="font-normal">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 w-[150px]"
                    />
                  </div>
                ),
            }
          : undefined;
        const subColumns: ColumnDef<Person>[] = newCol ? [newCol] : [];
        return columnHelper.group({
          id: `group-${col.id}`,
          header: col.header,
          columns: subColumns,
        });
      });
    }

    return cols;
  }, [
    props.enableColumnPinning,
    props.columnDefs,
    props.columns,
    props.withHeaderGroups,
    props.withTwoHeaderRows,
    props.enableColumnResizing,
    props.enableRowSelection,
    props.getExpandedRowModel,
    props.enableRowPinning,
    skin,
    HeaderPinButtons,
    Resizer,
    Cell,
    CellPercent,
    CellLink,
    CellAvatar,
    CellAvatarWithText,
    CellCurrency,
    CellNumber,
    CellTag,
    CellBadge,
  ]);

  const table = useReactTable({
    ...props,
    data,
    columns,
  });

  let skinOb: Skin | undefined;
  if (skin === "skin-mui") {
    skinOb = muiSkin.MuiSkin;
  } else if (skin === "skin-tailwind") {
    skinOb = twskin.TailwindSkin;
  } else if (skin === "skin-anocca") {
    skinOb = anoccaSkin.AnoccaSkin;
  }
  let content = <TableComponent {...props} table={table} skin={skinOb} />;
  if (skin === "skin-mui" || skin === "skin-anocca") {
    content = (
      <ScopedCssBaseline>
        <ThemeProvider theme={theme}>{content}</ThemeProvider>
      </ScopedCssBaseline>
    );
  } else if (skin === "skin-tailwind") {
    content = (
      <div className="rttui-table light" style={{ ...twskin.lightModeVars }}>
        {content}
      </div>
    );
  } else if (skin === "core") {
    content = (
      <div className="rttui-table" style={{ ...defaultSkin.vars }}>
        {content}
      </div>
    );
  }
  return content;
};

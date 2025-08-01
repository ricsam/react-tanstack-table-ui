import {
  Badge,
  Box,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from "@mui/material";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useCrushAllCols,
  useCrushHeader,
  useTableContext,
} from "@rttui/core";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { FiMoreHorizontal as MoreHorizontal } from "react-icons/fi";
import {
  LuArrowDown as ArrowDown,
  LuArrowUp as ArrowUp,
  LuCheck as Check,
  LuChevronRight as ChevronRight,
  LuArrowLeft,
  LuArrowRight,
} from "react-icons/lu";

interface AutosizeSubmenuItemsProps {
  onCrush: (type: "header" | "cell" | "both") => void;
  closeAllMenus: () => void;
}

function AutosizeSubmenuItems({
  onCrush,
  closeAllMenus,
}: AutosizeSubmenuItemsProps) {
  const handleItemClick = (type: "header" | "cell" | "both") => {
    onCrush(type);
    closeAllMenus();
  };

  return (
    <Paper sx={{ boxShadow: 3 }}>
      <MenuList autoFocusItem>
        <MenuItem onClick={() => handleItemClick("header")}>
          Autosize by headers
        </MenuItem>
        <MenuItem onClick={() => handleItemClick("cell")}>
          Autosize by cells
        </MenuItem>
        <MenuItem onClick={() => handleItemClick("both")}>
          Autosize by both
        </MenuItem>
      </MenuList>
    </Paper>
  );
}

export function ColumnOptions({
  onSort,
  onPin,
  sorted,
  children,
  icon,
  active,
}: {
  sorted?: "asc" | "desc" | false;
  onSort?: (sort: "asc" | "desc") => void;
  onPin?: (pin: "left" | "right") => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  const crushHeader = useCrushHeader();
  const crushAllColumns = useCrushAllCols();
  const colRef = useColRef();
  const { tableRef } = useTableContext();
  const {
    isSorted: tsIsSorted,
    canSort,
    isPinned,
    canPin,
    canHide,
  } = useColProps({
    callback: ({ column }) => {
      return {
        isSorted: column.getIsSorted(),
        canSort: column.getCanSort(),
        isPinned: column.getIsPinned(),
        canPin: column.getCanPin(),
        canHide: column.getCanHide(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });

  const isSorted = sorted ?? tsIsSorted;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activePopper, setActivePopper] = useState<string | null>(null);
  const [popperAnchorEl, setPopperAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const popperCloseTimerRef = useRef<number | null>(null);

  const clearPopperCloseTimer = () => {
    if (popperCloseTimerRef.current !== null) {
      clearTimeout(popperCloseTimerRef.current);
      popperCloseTimerRef.current = null;
    }
  };

  const openPopper = (type: string, anchor: HTMLElement) => {
    clearPopperCloseTimer();
    if (activePopper && activePopper !== type) {
      setActivePopper(null);
      requestAnimationFrame(() => {
        setActivePopper(type);
        setPopperAnchorEl(anchor);
      });
    } else {
      setActivePopper(type);
      setPopperAnchorEl(anchor);
    }
  };

  const closePopper = (immediate = false) => {
    clearPopperCloseTimer();
    if (immediate) {
      setActivePopper(null);
      setPopperAnchorEl(null);
    } else {
      popperCloseTimerRef.current = window.setTimeout(() => {
        setActivePopper(null);
        setPopperAnchorEl(null);
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      clearPopperCloseTimer();
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    closePopper(true);
  };

  return (
    <>
      <Badge
        badgeContent={" "}
        sx={{
          "& .MuiBadge-badge": {
            bgcolor: "text.disabled",
          },
        }}
        variant="dot"
        invisible={(!canSort && !canPin) || (!isSorted && !isPinned && !active)}
        overlap="circular"
      >
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{ padding: 0, width: "32px", height: "32px" }}
        >
          {icon ? icon : <MoreHorizontal />}
        </IconButton>
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {canSort && [
          <MenuItem
            key="sort-asc"
            onClick={() => {
              if (onSort) {
                onSort("asc");
              } else {
                if (isSorted === "asc") {
                  colRef().column.clearSorting();
                } else {
                  colRef().column.toggleSorting(false);
                }
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowUp />
            Sort ascending
            {isSorted === "asc" && <Check />}
          </MenuItem>,
          <MenuItem
            key="sort-desc"
            onClick={() => {
              if (onSort) {
                onSort("desc");
              } else {
                if (isSorted === "desc") {
                  colRef().column.clearSorting();
                } else {
                  colRef().column.toggleSorting(true);
                }
              }
              handleClose();
            }}
            sx={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowDown />
            Sort descending
            {isSorted === "desc" && <Check />}
          </MenuItem>,
          <Divider key="divider-1" />,
        ]}

        {canPin && [
          <MenuItem
            key="pin-left"
            onClick={() => {
              if (onPin) {
                onPin("left");
              } else {
                if (isPinned === "left") {
                  colRef().column.pin(false);
                } else {
                  colRef().column.pin("left");
                }
              }
              handleClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Pin left
            {isPinned === "left" && <Check />}
          </MenuItem>,
          <MenuItem
            key="pin-right"
            onClick={() => {
              if (onPin) {
                onPin("right");
              } else {
                if (isPinned === "right") {
                  colRef().column.pin(false);
                } else {
                  colRef().column.pin("right");
                }
              }
              handleClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Pin right
            {isPinned === "right" && <Check />}
          </MenuItem>,
          <Divider key="divider-2" />,
        ]}

        {canHide && [
          <MenuItem
            key="hide"
            onClick={() => {
              colRef()
                .column.getFlatColumns()
                .forEach((col) => {
                  col.toggleVisibility(false);
                });
              handleClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Hide
          </MenuItem>,
          <MenuItem
            key="show"
            onClick={() => {
              tableRef.current?.tanstackTable.resetColumnVisibility();
              handleClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Show all columns
          </MenuItem>,
          <Divider key="divider-3" />,
        ]}

        {["left", "right"].map((direction) => (
          <MenuItem
            key={direction}
            onClick={() => {
              const newOrder = tableRef.current?.tanstackTable
                .getVisibleLeafColumns()
                .map((col) => col.id);
              const currentLeafColumns = colRef()
                .column.getLeafColumns()
                .filter((col) => col.getIndex() > -1);

              // move current leaf columns to the left or right
              for (let i = 0; i < currentLeafColumns.length; i++) {
                const col = currentLeafColumns[i];
                const index = newOrder.indexOf(col.id);
                if (index > -1) {
                  newOrder.splice(index, 1);
                  newOrder.splice(
                    index + (direction === "left" ? -1 : 1),
                    0,
                    col.id,
                  );
                }
              }
              tableRef.current?.tanstackTable.setColumnOrder(newOrder);
              handleClose();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
              }}
            >
              <Typography variant="body1">Move {direction}</Typography>
              {direction === "left" ? <LuArrowLeft /> : <LuArrowRight />}
            </Box>
          </MenuItem>
        ))}
        <Divider />

        <MenuItem
          onClick={() => {
            crushHeader(colRef().header, "default");
            handleClose();
          }}
          onMouseEnter={(e) => openPopper("column", e.currentTarget)}
          onMouseLeave={() => closePopper()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Autosize this column
          <ChevronRight />
        </MenuItem>
        <MenuItem
          onClick={() => {
            crushAllColumns("default");
            handleClose();
          }}
          onMouseEnter={(e) => openPopper("all", e.currentTarget)}
          onMouseLeave={() => closePopper()}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          Autosize all columns
          <ChevronRight />
        </MenuItem>
        {children}
      </Menu>

      <Popper
        open={Boolean(activePopper && popperAnchorEl)}
        anchorEl={popperAnchorEl}
        placement="right-start"
        transition
        disablePortal={false}
        style={{ zIndex: 1301 }}
        modifiers={[
          {
            name: "offset",
            options: {
              offset: [-8, 0],
            },
          },
        ]}
        onMouseEnter={clearPopperCloseTimer}
        onMouseLeave={() => closePopper()}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <div>
              {activePopper === "column" && (
                <AutosizeSubmenuItems
                  onCrush={(type) => crushHeader(colRef().header, type)}
                  closeAllMenus={handleClose}
                />
              )}
              {activePopper === "all" && (
                <AutosizeSubmenuItems
                  onCrush={(type) => crushAllColumns(type)}
                  closeAllMenus={handleClose}
                />
              )}
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
}

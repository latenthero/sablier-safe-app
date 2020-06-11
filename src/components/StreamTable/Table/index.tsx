import React, { useCallback, useEffect, useMemo, useState, ReactElement } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import { makeStyles } from "@material-ui/core";

import TableHead from "./TableHead";
import { Column } from "./columns";
import { getSorting, stableSort, Order } from "./sorting";

const sm: string = "8px";
const xl: string = "32px";
const xxl: string = "40px";

const useStyles = makeStyles(() => ({
  loader: {
    /* boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)", */
  },
  root: {
    backgroundColor: "white",
    borderTopLeftRadius: sm,
    borderTopRightRadius: sm,
    /* boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)", */
  },
  paginationRoot: {
    backgroundColor: "white",
    /* boxShadow: "1px 2px 10px 0 rgba(212, 212, 211, 0.59)", */
    borderBottomLeftRadius: sm,
    borderBottomRightRadius: sm,
    marginBottom: xl,
  },
  selectRoot: {
    backgroundColor: "white",
    lineHeight: xxl,
  },
  white: {
    backgroundColor: "white",
  },
}));

const FIXED_HEIGHT: number = 49;

const backProps = {
  "aria-label": "Previous Page",
};

const nextProps = {
  "aria-label": "Next Page",
};

const getEmptyStyle = (emptyRows: number): object => ({
  alignItems: "center",
  backgroundColor: "white",
  borderTopLeftRadius: sm,
  borderTopRightRadius: sm,
  display: "flex",
  height: FIXED_HEIGHT * emptyRows,
  justifyContent: "center",
  width: "100%",
});

type Props = {
  children: Function;
  columns: Column[];
  data: any[];
  defaultFixed: boolean;
  defaultOrder: Order;
  defaultOrderBy: string;
  defaultRowsPerPage: number;
  disableLoadingOnEmptyTable?: boolean;
  disablePagination?: boolean;
  label: string;
  noBorder?: boolean;
  size: number;
};

function GnoTable(props: Props): ReactElement {
  const classes = useStyles();

  const {
    children,
    columns,
    data,
    defaultFixed,
    defaultOrder = "asc",
    defaultOrderBy,
    defaultRowsPerPage = 5,
    disableLoadingOnEmptyTable = false,
    disablePagination = false,
    label,
    noBorder,
    size,
  }: Props = props;

  /** State Variables */

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>();
  const [order, setOrder] = useState<Order>();
  const [orderBy, setOrderBy] = useState<string>();
  const [fixed, setFixed] = useState<boolean>();
  const [orderProp, setOrderProp] = useState<boolean>();

  /** Memoized Variables */

  const orderByParam = useMemo((): string => {
    return orderBy || defaultOrderBy;
  }, [defaultOrderBy, orderBy]);

  const orderParam = useMemo((): Order => {
    return order || defaultOrder;
  }, [defaultOrder, order]);

  const displayRows = useMemo((): number => {
    return rowsPerPage || defaultRowsPerPage;
  }, [defaultRowsPerPage, rowsPerPage]);

  const fixedParam = useMemo((): boolean => {
    return typeof fixed !== "undefined" ? fixed : Boolean(defaultFixed);
  }, [defaultFixed, fixed]);

  const paginationClasses = useMemo(() => {
    return {
      input: classes.white,
      root: !noBorder ? classes.paginationRoot : undefined,
      selectRoot: classes.selectRoot,
    };
  }, [classes, noBorder]);

  const sortedData = useMemo((): any => {
    let sortedDataHookScope = stableSort(data, getSorting(orderParam, orderByParam, orderProp as boolean), fixedParam);
    if (!disablePagination) {
      sortedDataHookScope = sortedData.slice(page * displayRows, page * displayRows + displayRows);
    }
    return sortedDataHookScope;
  }, [data, disablePagination, displayRows, fixedParam, orderByParam, orderParam, orderProp, page]);

  const emptyRows = useMemo((): number => {
    return displayRows - Math.min(displayRows, data.length - page * displayRows);
  }, [data, displayRows, page]);

  const isEmpty = useMemo((): boolean => {
    return size === 0 && !disableLoadingOnEmptyTable;
  }, [disableLoadingOnEmptyTable, size]);

  /** Callbacks **/

  const onSort = useCallback(
    (newOrderBy: string, newOrderProp: boolean): void => {
      let newOrder: Order = "desc";

      /* If table was previously sorted by the user */
      if (order && orderBy === newOrderBy && order === "desc") {
        newOrder = "asc";
      } else if (!order && defaultOrder === "desc") {
        /* If it was not sorted and defaultOrder is used */
        newOrder = "asc";
      }

      setOrder(newOrder);
      setOrderBy(newOrderBy);
      setOrderProp(newOrderProp);
      setFixed(false);
    },
    [defaultOrder, order, orderBy],
  );

  const handleChangePage = useCallback(
    (_e: any, newPage: number): void => {
      setPage(newPage);
    },
    [setPage],
  );

  const handleChangeRowsPerPage = useCallback(
    (e: any) => {
      const newRowsPerPage = Number(e.target.value);
      setRowsPerPage(newRowsPerPage);
    },
    [setRowsPerPage],
  );

  /** Side Effects **/

  useEffect(() => {
    if (defaultOrderBy && columns) {
      const defaultOrderCol: Column | undefined = columns.find(({ id }: { id: string }) => {
        return id === defaultOrderBy;
      });

      if (defaultOrderCol?.order) {
        setOrderProp(true);
      }
    }
  }, [defaultOrderBy, columns]);

  return (
    <>
      {!isEmpty && (
        <Table aria-labelledby={label} size="small" className={noBorder ? "" : classes.root}>
          <TableHead columns={columns} onSort={onSort} order={order} orderBy={orderByParam} />
          <TableBody>{children(sortedData)}</TableBody>
        </Table>
      )}
      {isEmpty && (
        <div className={classes.loader} style={getEmptyStyle(emptyRows + 1)}>
          <CircularProgress size={60} />
        </div>
      )}
      {!disablePagination && (
        <TablePagination
          backIconButtonProps={backProps}
          classes={paginationClasses}
          component="div"
          count={size}
          nextIconButtonProps={nextProps}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={displayRows}
          rowsPerPageOptions={[displayRows]}
        />
      )}
    </>
  );
}

export default GnoTable;

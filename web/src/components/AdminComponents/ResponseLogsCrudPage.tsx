import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faTrash,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

type ResponseLog = {
  RL_log_id: number;
  RL_report_id?: number | null;
  RL_type?: string;
  RL_message?: string;
  RL_created_at?: string;
};

const ResponseLogsCrudPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // No data wired from context yet — start empty
  const data: ResponseLog[] = useMemo(() => [], []);

  const columns: ColumnDef<ResponseLog>[] = useMemo(
    () => [
      {
        accessorKey: "RL_log_id",
        header: "ID",
      },
      {
        accessorKey: "RL_report_id",
        header: "Report ID",
        cell: ({ row }) => row.original.RL_report_id ?? "-",
      },
      {
        accessorKey: "RL_type",
        header: "Type",
        cell: ({ row }) => row.original.RL_type ?? "-",
      },
      {
        accessorKey: "RL_message",
        header: "Message",
        cell: ({ row }) => (
          <span
            style={{
              display: "inline-block",
              maxWidth: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.original.RL_message ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "RL_created_at",
        header: "Created At",
      },
      {
        id: "controls",
        header: "",
        cell: ({ row }) => (
          <div style={{ minWidth: 120 }}>
            <button
              className="btn btn-sm bg-orange mr-2 disabled"
              title="View"
              disabled
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="btn btn-sm btn-danger disabled"
              title="Delete"
              disabled
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const isEmpty = data.length === 0;

  return (
    <div
      className="container pt-3"
      style={{ height: "90vh", overflowY: "hidden" }}
    >
      <div className="row w-100">
        <div
          className="d-flex flex-row justify-content-between align-items-center"
          style={{ height: "5vh", color: "#c2410c" }}
        >
          <div>
            <h5 className="box-title">Response Logs</h5>
          </div>
        </div>

        <div
          className="card py-3 px-4 w-100"
          style={{
            height: "80vh",
            borderRadius: "1rem",
            backgroundColor: "rgb(17, 22, 43)",
            overflowX: "hidden",
          }}
        >
          <div className="d-flex justify-content-between mb-3">
            <input
              type="text"
              placeholder="Search response logs..."
              className="form-control form-control-sm w-25 custom-input-2 px-3"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <div>
              <button
                className="btn btn-primary disabled btn-sm mr-2"
                style={{ backgroundColor: "rgb(249, 115, 22)", border: "none" }}
                disabled
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New
              </button>
            </div>
          </div>

          {isEmpty ? (
            <div
              style={{
                height: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="text-center text-muted">
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗂️</div>
                <h4 className="mb-2">No response logs</h4>
                <p className="text-sm text-muted">
                  There are no response logs to display. When the system records
                  responses to reports they will appear here.
                </p>
                <p className="text-xs text-muted">
                  You can add or manage response logs once the backend is wired
                  into this UI.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <div style={{ flex: 1, overflow: "auto", marginBottom: "1rem" }}>
                <table style={{ width: "100%" }}>
                  <thead style={{ userSelect: "none", cursor: "pointer" }}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="mb-2 text-muted text-xs"
                        style={{ borderBottom: "1px solid rgb(100, 106, 133)" }}
                      >
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-2 pb-1"
                            onClick={() => header.column.toggleSorting()}
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() ? (
                              header.column.getIsSorted() === "desc" ? (
                                <FontAwesomeIcon
                                  icon={faArrowUp}
                                  className="ml-2"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faArrowDown}
                                  className="ml-2"
                                />
                              )
                            ) : null}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="text-sm">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-2 pt-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "0.5rem 0",
                  borderTop: "1px solid rgb(100, 106, 133)",
                }}
              >
                <span>
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <div
                  className="d-flex justify-content-end"
                  style={{ width: "50%" }}
                >
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="btn btn-sm btn-secondary mr-1"
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="btn btn-sm btn-secondary mr-1"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="btn btn-sm btn-secondary mr-1"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="btn btn-sm btn-secondary"
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseLogsCrudPage;

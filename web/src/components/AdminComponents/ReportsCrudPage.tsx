import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
  faBellSlash,
  faCheck,
  faCheckCircle,
  faEdit,
  faHourglass,
  faPlus,
  faQuestion,
  faThumbsUp,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import type { CombinedReport } from "../../constants/types/database";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import ReportEditModal from "./ReportEditModal";

const ReportsCrudPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [selectedRow, setSelectedRow] = useState<CombinedReport | null>(null);
  const [showSelectedModal, setShowSelectedModal] = useState<boolean>(false);

  const handleExitClick = () => {
    setShowSelectedModal(false);
    setSelectedRow(null);
  };

  const generateVisualBadge = (level: string | undefined) => {
    if (level == undefined) {
      return (
        <div className="badge badge-muted">
          <span className="badge-text text-xs">None</span>
        </div>
      );
    }

    const normalizedLevel = level.toLowerCase();

    if (["small", "mild", "low"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-secondary">
          <span className="badge-text text-xs px-2">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }

    if (["moderate", "medium"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-warning">
          <span className="badge-text text-xs px-2">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }

    if (["large", "severe", "high"].includes(normalizedLevel)) {
      return (
        <div className="badge badge-danger">
          <span className="badge-text text-xs px-2">
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </span>
        </div>
      );
    }
  };

  const generateConfidenceColor = (confidence: number | undefined) => {
    if (confidence === undefined) {
      return <span className="text-muted">N/A</span>;
    }

    const percentage = confidence * 100;

    if (percentage >= 0 && percentage <= 40) {
      return <span className="text-danger">{percentage}%</span>;
    } else if (percentage >= 41 && percentage <= 80) {
      return <span className="text-warning">{percentage}%</span>;
    } else if (percentage >= 81 && percentage <= 100) {
      return <span className="text-success">{percentage}%</span>;
    } else {
      return <span className="text-muted">Invalid Value</span>;
    }
  };

  const renderReportStatusBadge = (role: string | undefined) => {
    let badgeStyle: { backgroundColor: string; color: string } = {
      backgroundColor: "",
      color: "",
    };
    let badgeText = "";
    let badgeIcon;

    switch (role) {
      case "pending":
        badgeStyle = {
          backgroundColor: "#F59E0B", // BG-WARNING
          color: "#000000",
        };
        badgeText = "Pending";
        badgeIcon = faHourglass;
        break;
      case "verified":
        badgeStyle = {
          backgroundColor: "#3B82F6", // BG-PRIMARY
          color: "#FFFFFF",
        };
        badgeText = "Validated";
        badgeIcon = faThumbsUp;
        break;
      case "false_alarm":
        badgeStyle = {
          backgroundColor: "#EF4444", // BG-DANGER
          color: "#FFFFFF",
        };
        badgeText = "False Alarm";
        badgeIcon = faBellSlash;
        break;
      case "resolved":
        badgeStyle = {
          backgroundColor: "#22C55E", // BG-GREEN
          color: "#FFFFFF",
        };
        badgeText = "Resolved";
        badgeIcon = faCheckCircle;
        break;
      default:
        badgeStyle = {
          backgroundColor: "#111827", // GRAY
          color: "#FFFFFF",
        };
        badgeText = "Unknown status";
        badgeIcon = faQuestion;
        break;
    }

    return (
      <span
        style={{
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: "1rem",
          color: badgeStyle.color,
        }}
        className="badge badge-xs text-bold px-2 py-1"
      >
        <FontAwesomeIcon icon={badgeIcon} className="mr-2" />
        {badgeText}
      </span>
    );
  };

  const renderVerifiedIcon = (verified: boolean | undefined) => {
    if (verified === undefined) {
      return <span className="text-muted">N/A</span>;
    }

    return verified ? (
      <FontAwesomeIcon icon={faCheck} className="text-success" />
    ) : (
      <FontAwesomeIcon icon={faTimes} className="text-danger" />
    );
  };

  const { combinedReports, userAccounts } = useAdminSQL();

  const data: CombinedReport[] = combinedReports;

  const columns: ColumnDef<CombinedReport>[] = [
    {
      accessorKey: "0.PR_report_id",
      header: ({ table }) => (
        <>
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label="Select all rows"
            className="mr-2"
            style={{ backgroundColor: "transparent", opacity: 0.5 }}
          />
          Report ID
        </>
      ),
      cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`Select row ${row.id}`}
            className="mr-2"
            style={{ backgroundColor: "transparent", opacity: 0.5 }}
          />
          <span>{row.original[0].PR_report_id}</span>
        </div>
      ),
    },
    {
      accessorKey: "0.PR_user_id",
      header: "Name",
      cell: ({ row }) => {
        const userId = row.original[0].PR_user_id;
        const userAccount = userAccounts.find(
          (account) => account.UA_user_id === userId
        );

        return (
          <span>
            {"@" + userAccount?.UA_username ||
              `${userAccount?.UA_first_name || ""} ${
                userAccount?.UA_last_name || ""
              }`.trim() ||
              `User ${userId}`}
          </span>
        );
      },
    },
    {
      accessorKey: "0.coordinates",
      header: "Coordinates",
      cell: ({ row }) => {
        return (
          <div className="text-sm text-muted" style={{ minWidth: 150 }}>
            ({row.original[0].PR_latitude}, {row.original[0].PR_longitude})
          </div>
        );
      },
    },
    {
      accessorKey: "0.PR_address",
      header: "Address",
      cell: ({ row }) => {
        return (
          <div className="text-xs" style={{ width: 250 }}>
            {row.original[0].PR_address}
          </div>
        );
      },
    },
    {
      accessorKey: "0.PR_timestamp",
      accessorFn: (row) => new Date(row[0].PR_timestamp).getTime(),
      header: "Timestamp",
      cell: ({ row }) => {
        const date = new Date(row.original[0].PR_timestamp).toLocaleString();
        return <div className="text-xs">{date}</div>;
      },
    },
    {
      accessorKey: "0.PR_verified",
      header: "Verified",
      cell: ({ row }) => {
        return renderVerifiedIcon(row.original[0]?.PR_verified);
      },
    },
    {
      accessorKey: "0.PR_report_status",
      header: "Report Status",
      cell: ({ row }) => {
        return renderReportStatusBadge(row.original[0]?.PR_report_status);
      },
    },
    {
      accessorKey: "1.VR_confidence_score",
      header: "Confidence",
      cell: ({ row }) => {
        return generateConfidenceColor(row.original[1]?.VR_confidence_score);
      },
    },
    {
      accessorKey: "1.VR_detected",
      header: "Detected",
      cell: ({ row }) => {
        return renderVerifiedIcon(row.original[1]?.VR_detected);
      },
    },
    {
      accessorKey: "1.VR_severity_level",
      header: "Severity Level",
      cell: ({ row }) => {
        return generateVisualBadge(row.original[1]?.VR_severity_level);
      },
    },
    {
      accessorKey: "1.VR_spread_potential",
      header: "Spread Potential",
      cell: ({ row }) => {
        return generateVisualBadge(row.original[1]?.VR_spread_potential);
      },
    },
    {
      accessorKey: "1.VR_fire_type",
      header: "Fire Type",
      cell: ({ row }) => {
        return generateVisualBadge(row.original[1]?.VR_fire_type);
      },
    },
    {
      accessorKey: "user_controls",
      header: "User Controls",
      enableColumnFilter: false,
      cell: ({ row }) => {
        return (
          <div
            className="d-flex flex-row justify-content-start align-items-center"
            style={{ width: 125 }}
          >
            <button
              className="btn btn-md btn-primary p-1 px-2 d-flex flex-row"
              style={{ backgroundColor: "rgb(249, 115, 22)", border: "none" }}
              onClick={() => {
                setSelectedRow(row.original);
                setShowSelectedModal(true);
              }}
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit
            </button>
            <FontAwesomeIcon
              icon={faTrash}
              className="ml-3 text-muted"
              style={{ cursor: "pointer" }}
            />
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sorting,
      globalFilter,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <>
      <div
        className="container-fluid"
        style={{ height: "90vh", overflowY: "hidden" }}
      >
        <div className="row w-100">
          <div
            className="d-flex flex-row justify-content-between align-items-center"
            style={{ height: "5vh", color: "#c2410c" }}
          >
            <div>
              <h5 className="box-title">All Submitted Reports</h5>
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
                placeholder="Search reports..."
                className="form-control form-control-sm w-25 custom-input-2 px-3"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{
                  backgroundColor: "rgb(249, 115, 22)",
                  border: "none",
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New Report
              </button>
            </div>
            {Object.keys(rowSelection).length > 0 && (
              <div
                className="d-flex align-items-center mb-3 p-2 px-4 justify-content-between"
                style={{
                  backgroundColor: "rgba(249, 115, 22, 0.1)",
                  borderRadius: "1rem",
                }}
              >
                <div className="d-flex">
                  <span className="me-3">
                    {Object.keys(rowSelection).length} row(s) selected
                  </span>
                </div>
                <div className="d-flex">
                  <button
                    className="btn btn-danger btn-sm mr-2"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete the selected rows?"
                        )
                      ) {
                        console.log(
                          "Selected rows to delete:",
                          Object.keys(rowSelection)
                        );
                        setRowSelection({});
                      }
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                    Delete Selected
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setRowSelection({})}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  marginBottom: "1rem",
                }}
              >
                <table style={{ width: "100%" }}>
                  <thead style={{ userSelect: "none", cursor: "pointer" }}>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr
                        key={headerGroup.id}
                        className="mb-2 text-muted text-xs"
                        style={{
                          borderBottom: "1px solid rgb(100, 106, 133)",
                        }}
                      >
                        {headerGroup.headers.map((header) => (
                          <th
                            className="px-2 pb-1"
                            key={header.id}
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
                  style={{
                    width: "50%",
                  }}
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
          </div>
        </div>
      </div>
      <ReportEditModal
        showSelectedModal={showSelectedModal}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        handleExitClick={handleExitClick}
      />
    </>
  );
};

export default ReportsCrudPage;

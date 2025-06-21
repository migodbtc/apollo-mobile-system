import { useState } from "react";
import type { UserRole } from "../../constants/types/types";
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
  faEdit,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import UserEditModal from "./UserEditModal";

type UserType = {
  UA_user_id: number;
  UA_username: string;
  UA_password?: string;
  UA_user_role: UserRole;
  UA_created_at: string;
  UA_last_name: string;
  UA_first_name: string;
  UA_middle_name?: string;
  UA_suffix?: string;
  UA_email_address: string;
  UA_phone_number: string;
  UA_reputation_score: number;
  UA_id_picture_front?: number;
  UA_id_picture_back?: number;
};

const data: UserType[] = [
  {
    UA_user_id: 25060001,
    UA_username: "johndoe",
    UA_user_role: "responder",
    UA_created_at: "2024-01-20T12:00:00Z",
    UA_last_name: "Doe",
    UA_first_name: "John",
    UA_middle_name: "M",
    UA_suffix: "Jr.",
    UA_email_address: "john.doe@example.com",
    UA_phone_number: "123-456-7890",
    UA_reputation_score: 75,
  },
  {
    UA_user_id: 25060002,
    UA_username: "janedoe",
    UA_user_role: "admin",
    UA_created_at: "2024-02-15T14:30:00Z",
    UA_last_name: "Doe",
    UA_first_name: "Jane",
    UA_middle_name: "A",
    UA_suffix: "Sr.",
    UA_email_address: "jane.doe@example.com",
    UA_phone_number: "987-654-3210",
    UA_reputation_score: 92,
  },
  {
    UA_user_id: 25060003,
    UA_username: "peterparker",
    UA_user_role: "superadmin",
    UA_created_at: "2024-03-01T09:00:00Z",
    UA_last_name: "Parker",
    UA_first_name: "Peter",
    UA_middle_name: "",
    UA_suffix: "",
    UA_email_address: "peter.parker@example.com",
    UA_phone_number: "555-123-4567",
    UA_reputation_score: 88,
  },
  {
    UA_user_id: 25060004,
    UA_username: "clarkkent",
    UA_user_role: "responder",
    UA_created_at: "2024-03-15T16:45:00Z",
    UA_last_name: "Kent",
    UA_first_name: "Clark",
    UA_middle_name: "J",
    UA_suffix: "",
    UA_email_address: "clark.kent@example.com",
    UA_phone_number: "111-222-3333",
    UA_reputation_score: 65,
  },
  {
    UA_user_id: 25060005,
    UA_username: "brucewayne",
    UA_user_role: "admin",
    UA_created_at: "2024-04-01T11:15:00Z",
    UA_last_name: "Wayne",
    UA_first_name: "Bruce",
    UA_middle_name: "T",
    UA_suffix: "",
    UA_email_address: "bruce.wayne@example.com",
    UA_phone_number: "444-555-6666",
    UA_reputation_score: 95,
  },
];

const renderRoleBadge = (role: string | undefined) => {
  let badgeStyle: { backgroundColor: string; color: string } = {
    backgroundColor: "",
    color: "",
  };
  let badgeText = "";

  switch (role) {
    case "guest":
      badgeStyle = {
        backgroundColor: "#111827", // GRAY
        color: "#FFFFFF",
      };
      badgeText = "Guest";
      break;
    case "civilian":
      badgeStyle = {
        backgroundColor: "#3B82F6", // BLUE
        color: "#FFFFFF",
      };
      badgeText = "Civilian";
      break;
    case "responder":
      badgeStyle = {
        backgroundColor: "#F59E0B", // AMBER
        color: "#FFFFFF",
      };
      badgeText = "Responder";
      break;
    case "admin":
      badgeStyle = {
        backgroundColor: "#EF4444", // RED
        color: "#FFFFFF",
      };
      badgeText = "Administrator";
      break;
    case "superadmin":
      badgeStyle = {
        backgroundColor: "#01B073", // TEAL
        color: "#FFFFFF",
      };
      badgeText = "Superadministrator";
      break;
    default:
      badgeStyle = {
        backgroundColor: "#6B7280", // CYAN
        color: "#FFFFFF",
      };
      badgeText = "Unknown Role";
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
      {badgeText}
    </span>
  );
};

const UserCrudPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [selectedRow, setSelectedRow] = useState<UserType | null>(null);
  const [showSelectedModal, setShowSelectedModal] = useState<boolean>(false);

  const handleExitClick = () => {
    setShowSelectedModal(false);
    setSelectedRow(null);
  };

  const columns: ColumnDef<UserType>[] = [
    {
      id: "selection-id",
      accessorKey: "UA_user_id",
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
          ID
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
          <span>{row.original.UA_user_id}</span>
        </div>
      ),
    },
    {
      accessorKey: "UA_username",
      header: "Username",
      cell: ({ row }) => {
        return (
          <span style={{ color: "rgb(249, 115, 22)" }}>
            @{row.original.UA_username}
          </span>
        );
      },
    },
    {
      id: "fullName",
      header: "Full Name",
      cell: ({ row }) => {
        const firstName = row.original.UA_first_name || "";
        const middleName = row.original.UA_middle_name || "";
        const lastName = row.original.UA_last_name || "";
        const suffix = row.original.UA_suffix || "";
        return `${firstName} ${middleName} ${lastName} ${suffix}`.trim();
      },
    },
    {
      accessorKey: "UA_user_role",
      header: "Role",
      cell: ({ row }) => {
        return renderRoleBadge(row.original.UA_user_role);
      },
    },
    {
      accessorKey: "UA_created_at",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.original.UA_created_at).toLocaleString();
      },
    },
    {
      accessorKey: "UA_email_address",
      header: "Email",
    },
    {
      accessorKey: "UA_phone_number",
      header: "Phone Number",
    },
    {
      accessorKey: "UA_reputation_score",
      header: "Reputation",
    },
    {
      accessorKey: "UA_user_controls",
      header: "User Controls",
      enableColumnFilter: false,
      cell: ({ row }) => {
        return (
          <>
            <button
              className="btn btn-md btn-primary p-1 px-2"
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
          </>
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
              <h5 className="box-title">Registered Users</h5>
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
                placeholder="Search users..."
                className="form-control form-control-sm w-25 custom-input-2 px-3"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              <button
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: "rgb(249, 115, 22)", border: "none" }}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New User
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
                        style={{ borderBottom: "1px solid rgb(100, 106, 133)" }}
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
      <UserEditModal
        showSelectedModal={showSelectedModal}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        handleExitClick={handleExitClick}
      />
    </>
  );
};

export default UserCrudPage;

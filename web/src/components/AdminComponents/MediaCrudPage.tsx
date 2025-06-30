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
  faTrash,
  faPlus,
  faEye,
  faDownload,
  faQuestion,
  faCamera,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import type { MediaStorage } from "../../constants/types/database";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";
import axios from "axios";
import { SERVER_LINK } from "../../constants/netvar";
import MediaViewModal from "./MediaViewModal";

const MediaCrudPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  const [selectedMedia, setSelectedMedia] = useState<MediaStorage | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);

  const { userAccounts, mediaStorage, fetchMediaStorageDetails } =
    useAdminSQL();

  const renderMediaTypeBadge = (mediaType?: string) => {
    let badgeStyle: { backgroundColor: string; color: string } = {
      backgroundColor: "#6B7280", // Default gray
      color: "#fff",
    };
    let badgeText = "Unknown";
    let badgeIcon = faQuestion;

    if (mediaType?.startsWith("image/")) {
      badgeStyle = {
        backgroundColor: "#22C55E", // emerald green
        color: "#fff",
      };
      badgeText = "Image";
      badgeIcon = faCamera;
    } else if (mediaType?.startsWith("video/")) {
      badgeStyle = {
        backgroundColor: "#7C3AED", // purple
        color: "#fff",
      };
      badgeText = "Video";
      badgeIcon = faVideo;
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

  const deleteMedia = async (mediaId: number) => {
    if (!mediaId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this media file? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      const response = await axios.post(
        `${SERVER_LINK}/media/delete`,
        { MS_media_id: mediaId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        alert("Media deleted successfully!");
        fetchMediaStorageDetails();
      } else {
        alert("Failed to delete media.");
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      alert("Failed to delete media. Please try again.");
    }
  };

  const data: MediaStorage[] = mediaStorage;

  const columns: ColumnDef<MediaStorage>[] = [
    {
      id: "selection-id",
      accessorKey: "MS_media_id",
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
          <span>{row.original.MS_media_id}</span>
        </div>
      ),
    },
    {
      accessorKey: "MS_user_owner",
      header: "Name",
      cell: ({ row }) => {
        const userId = row.original.MS_user_owner;
        const userAccount = userAccounts.find(
          (account) => account.UA_user_id === userId
        );

        if (userAccount === undefined) {
          return <span className="text-muted text-bold">N/A</span>;
        }

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
      accessorKey: "MS_file_type",
      header: "File Type",
      cell: ({ row }) => {
        return renderMediaTypeBadge(row.original.MS_file_type);
      },
    },
    {
      accessorKey: "MS_file_name",
      header: "File Name",
    },
    {
      id: "mediaControls",
      header: "Controls",
      enableColumnFilter: false,
      cell: ({ row }) => (
        <div style={{ minWidth: 120 }}>
          <a
            rel="noopener noreferrer"
            className="btn btn-sm bg-orange mr-2"
            style={{ border: "none" }}
            title="View"
            onClick={() => {
              console.log("View media:", row.original);
              console.log("Selected Media:", selectedMedia);
              setSelectedMedia(row.original);
              setShowMediaModal(true);
            }}
          >
            <FontAwesomeIcon icon={faEye} />
          </a>
          <a
            href={
              typeof row.original.MS_file_data === "string"
                ? row.original.MS_file_data
                : "#"
            }
            download={row.original.MS_file_name}
            className="btn btn-sm btn-secondary mr-2"
            style={{ border: "none" }}
            title="Download"
          >
            <FontAwesomeIcon icon={faDownload} />
          </a>
          <FontAwesomeIcon
            icon={faTrash}
            className="text-muted"
            style={{ cursor: "pointer" }}
            title="Delete"
            onClick={() => deleteMedia(row.original.MS_media_id)}
          />
        </div>
      ),
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
            <h5 className="box-title">Media Storage</h5>
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
              placeholder="Search media..."
              className="form-control form-control-sm w-25 custom-input-2 px-3"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: "rgb(249, 115, 22)", border: "none" }}
              // onClick={handleAddMedia} // Implement add media logic if needed
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Media
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
                        "Are you sure you want to delete the selected media?"
                      )
                    ) {
                      Object.keys(rowSelection).forEach((rowId) => {
                        const row = table.getRow(rowId);
                        if (row) {
                          deleteMedia(row.original.MS_media_id);
                        }
                      });
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
      <MediaViewModal
        mediaId={selectedMedia?.MS_media_id || null}
        showModal={showMediaModal}
        handleClose={() => {
          setShowMediaModal(false);
          setSelectedMedia(null);
        }}
      />
    </div>
  );
};

export default MediaCrudPage;

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReportStatus } from "../../constants/types/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

// Use the PreverifiedReport type from your shared types if available
type PreverifiedReportType = {
  PR_report_id: number;
  PR_user_id: number;
  PR_image?: number;
  PR_video?: number;
  PR_latitude: number;
  PR_longitude: number;
  PR_address: string;
  PR_timestamp: string;
  PR_verified: boolean;
  PR_report_status: ReportStatus;
};

const columns: ColumnDef<PreverifiedReportType>[] = [
  {
    accessorKey: "PR_user_id",
    header: "User",
    cell: ({ row }) => {
      const userId = row.original.PR_user_id;
      return userId !== -1 ? (
        { userId }
      ) : (
        <span className="badge text-muted">N/A</span>
      );
    },
  },
  {
    accessorKey: "PR_address",
    header: "Address",
  },
  {
    accessorKey: "PR_timestamp",
    header: "Timestamp",
  },
  {
    accessorKey: "PR_verified",
    header: "Verified",
    cell: ({ row }) =>
      row.getValue("PR_verified") ? (
        <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#01B073" }} />
      ) : (
        <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#EF4444" }} />
      ),
  },
  {
    accessorKey: "PR_report_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("PR_report_status");
      if (status === "pending") {
        return <span className="badge badge-danger">Pending</span>;
      } else if (status === "verified") {
        return <span className="badge badge-primary">Verified</span>;
      } else if (status === "false_alarm") {
        return <span className="badge badge-warning">False Alarm</span>;
      } else if (status === "resolved") {
        return <span className="badge badge-success">Resolved</span>;
      }
      return "N/A";
    },
  },
];

const RecentReportsTable = () => {
  const { combinedReports } = useAdminSQL();

  // Get the most recent 10 reports, sorted by timestamp descending
  const recentReports: PreverifiedReportType[] = [...combinedReports]
    .sort((a, b) => {
      const dateA = new Date(a[0].PR_timestamp).getTime();
      const dateB = new Date(b[0].PR_timestamp).getTime();
      return dateB - dateA;
    })
    .slice(0, 10)
    .map(([pre]) => pre);

  recentReports.forEach((report) => {
    // Ensure all fields are present, defaulting to empty strings if necessary
    report.PR_user_id = report.PR_user_id || -1;
    report.PR_address = report.PR_address || "N/A";
    report.PR_timestamp = report.PR_timestamp || new Date().toISOString();
    report.PR_verified = report.PR_verified ?? false;
    report.PR_report_status = report.PR_report_status || "pending";
  });

  const table = useReactTable({
    data: recentReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-container mb-4 pb-5" style={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} style={{ color: "#c2410c" }}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext()) ||
                    "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentReportsTable;

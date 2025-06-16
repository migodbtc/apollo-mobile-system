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

const data: PreverifiedReportType[] = [
  {
    PR_report_id: 1,
    PR_user_id: 101,
    PR_image: undefined,
    PR_video: 301,
    PR_latitude: 37.774929,
    PR_longitude: -122.419418,
    PR_address: "123 Market St, San Francisco, CA",
    PR_timestamp: "2023-10-01 12:00:00",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 2,
    PR_user_id: 102,
    PR_image: 202,
    PR_video: undefined,
    PR_latitude: 34.052235,
    PR_longitude: -118.243683,
    PR_address: "456 Sunset Blvd, Los Angeles, CA",
    PR_timestamp: "2023-10-02 14:30:00",
    PR_verified: false,
    PR_report_status: "pending",
  },
  {
    PR_report_id: 3,
    PR_user_id: 103,
    PR_image: undefined,
    PR_video: 302,
    PR_latitude: 40.712776,
    PR_longitude: -74.005974,
    PR_address: "789 Broadway, New York, NY",
    PR_timestamp: "2023-10-03 09:15:00",
    PR_verified: true,
    PR_report_status: "resolved",
  },
  {
    PR_report_id: 4,
    PR_user_id: 104,
    PR_image: 203,
    PR_video: undefined,
    PR_latitude: 41.878113,
    PR_longitude: -87.629799,
    PR_address: "101 Michigan Ave, Chicago, IL",
    PR_timestamp: "2023-10-04 11:45:00",
    PR_verified: false,
    PR_report_status: "false_alarm",
  },
  {
    PR_report_id: 5,
    PR_user_id: 105,
    PR_image: undefined,
    PR_video: 420,
    PR_latitude: 29.760427,
    PR_longitude: -95.369804,
    PR_address: "202 Main St, Houston, TX",
    PR_timestamp: "2023-10-05 08:30:00",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 6,
    PR_user_id: 106,
    PR_image: 305,
    PR_video: undefined,
    PR_latitude: 34.052235,
    PR_longitude: -118.243683,
    PR_address: "200 N Spring St, Los Angeles, CA",
    PR_timestamp: "2023-10-06 14:15:00",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 7,
    PR_user_id: 107,
    PR_image: undefined,
    PR_video: 421,
    PR_latitude: 40.712776,
    PR_longitude: -74.005974,
    PR_address: "1 Police Plaza, New York, NY",
    PR_timestamp: "2023-10-07 09:20:00",
    PR_verified: false,
    PR_report_status: "pending",
  },
  {
    PR_report_id: 8,
    PR_user_id: 108,
    PR_image: 206,
    PR_video: undefined,
    PR_latitude: 39.952583,
    PR_longitude: -75.165222,
    PR_address: "1401 John F Kennedy Blvd, Philadelphia, PA",
    PR_timestamp: "2023-10-08 16:45:00",
    PR_verified: true,
    PR_report_status: "verified",
  },
  {
    PR_report_id: 9,
    PR_user_id: 109,
    PR_image: undefined,
    PR_video: 422,
    PR_latitude: 32.715738,
    PR_longitude: -117.161084,
    PR_address: "1600 Pacific Highway, San Diego, CA",
    PR_timestamp: "2023-10-09 10:10:00",
    PR_verified: false,
    PR_report_status: "pending",
  },
  {
    PR_report_id: 10,
    PR_user_id: 110,
    PR_image: 207,
    PR_video: 423,
    PR_latitude: 39.739236,
    PR_longitude: -104.990251,
    PR_address: "1331 17th St, Denver, CO",
    PR_timestamp: "2023-10-10 13:25:00",
    PR_verified: true,
    PR_report_status: "resolved",
  },
];

const RecentReportsTable = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-container mb-4" style={{ width: "100%" }}>
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

import type { UserRole } from "../../constants/types/types";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useAdminSQL } from "../../constants/context/AdminSQLContext";

type PersonnelUserAccount = {
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

const columns: ColumnDef<PersonnelUserAccount>[] = [
  {
    accessorKey: "UA_username",
    header: "Username",
    cell: ({ row }) => {
      const username = row.getValue("UA_username") as string;
      return `@${username}`;
    },
  },
  {
    accessorKey: "UA_user_role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("UA_user_role") as UserRole;
      if (role === "admin") {
        return (
          <span className="badge" style={{ backgroundColor: "#EF4444" }}>
            Administrator
          </span>
        );
      } else if (role === "superadmin") {
        return (
          <span className="badge" style={{ backgroundColor: "#01B073" }}>
            Superadministrator
          </span>
        );
      }
      return null;
    },
  },
];

const PersonnelPreview = () => {
  const { userAccounts } = useAdminSQL();

  // Only show admin and superadmin roles
  const personnelData: PersonnelUserAccount[] = userAccounts.filter(
    (user) =>
      user.UA_user_role === "admin" || user.UA_user_role === "superadmin"
  );

  const table = useReactTable({
    data: personnelData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-container mb-3" style={{ width: "100%" }}>
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

export default PersonnelPreview;

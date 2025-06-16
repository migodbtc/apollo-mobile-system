import type { UserRole } from "../../constants/types/types";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

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

      if (role == "admin") {
        return (
          <span className={`badge`} style={{ backgroundColor: "#EF4444" }}>
            Administrator
          </span>
        );
      } else if (role == "superadmin") {
        return (
          <span className={`badge`} style={{ backgroundColor: "#01B073" }}>
            Superadministrator
          </span>
        );
      }
    },
  },
];

const data: PersonnelUserAccount[] = [
  {
    UA_user_id: 1,
    UA_username: "jsmith",
    UA_user_role: "admin",
    UA_created_at: "2023-01-15T08:30:00Z",
    UA_last_name: "Smith",
    UA_first_name: "John",
    UA_email_address: "john.smith@example.com",
    UA_phone_number: "+1234567890",
    UA_reputation_score: 85,
  },
  {
    UA_user_id: 2,
    UA_username: "mjohnson",
    UA_user_role: "superadmin",
    UA_created_at: "2022-11-20T10:15:00Z",
    UA_last_name: "Johnson",
    UA_first_name: "Mary",
    UA_middle_name: "Anne",
    UA_email_address: "mary.johnson@example.com",
    UA_phone_number: "+1987654321",
    UA_reputation_score: 95,
    UA_id_picture_front: 101,
  },
  {
    UA_user_id: 3,
    UA_username: "rbrown",
    UA_user_role: "admin",
    UA_created_at: "2023-03-05T14:45:00Z",
    UA_last_name: "Brown",
    UA_first_name: "Robert",
    UA_suffix: "Jr.",
    UA_email_address: "robert.brown@example.com",
    UA_phone_number: "+1122334455",
    UA_reputation_score: 78,
    UA_id_picture_back: 102,
  },
  {
    UA_user_id: 4,
    UA_username: "ldavis",
    UA_user_role: "admin",
    UA_created_at: "2023-02-18T09:20:00Z",
    UA_last_name: "Davis",
    UA_first_name: "Lisa",
    UA_email_address: "lisa.davis@example.com",
    UA_phone_number: "+1567890123",
    UA_reputation_score: 88,
  },
  {
    UA_user_id: 5,
    UA_username: "twilson",
    UA_user_role: "superadmin",
    UA_created_at: "2022-12-10T11:30:00Z",
    UA_last_name: "Wilson",
    UA_first_name: "Thomas",
    UA_middle_name: "Edward",
    UA_email_address: "thomas.wilson@example.com",
    UA_phone_number: "+1445566778",
    UA_reputation_score: 92,
    UA_id_picture_front: 103,
    UA_id_picture_back: 104,
  },
  {
    UA_user_id: 6,
    UA_username: "cmorales",
    UA_user_role: "admin",
    UA_created_at: "2023-04-22T13:10:00Z",
    UA_last_name: "Morales",
    UA_first_name: "Carlos",
    UA_middle_name: "Miguel",
    UA_suffix: "Sr.",
    UA_email_address: "carlos.morales@example.com",
    UA_phone_number: "+1654321890",
    UA_reputation_score: 82,
    UA_id_picture_front: 105,
  },
  {
    UA_user_id: 7,
    UA_username: "kpatel",
    UA_user_role: "superadmin",
    UA_created_at: "2022-10-05T16:20:00Z",
    UA_last_name: "Patel",
    UA_first_name: "Kavita",
    UA_email_address: "kavita.patel@example.com",
    UA_phone_number: "+1876543290",
    UA_reputation_score: 97,
    UA_id_picture_back: 106,
  },
  {
    UA_user_id: 8,
    UA_username: "jnguyen",
    UA_user_role: "admin",
    UA_created_at: "2023-05-30T07:45:00Z",
    UA_last_name: "Nguyen",
    UA_first_name: "Jason",
    UA_email_address: "jason.nguyen@example.com",
    UA_phone_number: "+1239876540",
    UA_reputation_score: 76,
  },
];

const PersonnelPreview = () => {
  const table = useReactTable({
    data,
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

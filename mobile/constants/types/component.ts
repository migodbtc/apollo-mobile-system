import { FontAwesome } from "@expo/vector-icons";
import { NavigationButtonConfig } from "../interfaces/components";
import { UserRole } from "../interfaces/database";

export type FontAwesomeIconName = React.ComponentProps<
  typeof FontAwesome
>["name"];

export type RoleBasedButtonsConfig = {
  [role in UserRole]: NavigationButtonConfig[];
};

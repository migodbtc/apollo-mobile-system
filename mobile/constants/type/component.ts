import { FontAwesome } from "@expo/vector-icons";
import { NavigationButtonConfig } from "../interfaces/components";

export type FontAwesomeIconName = React.ComponentProps<
  typeof FontAwesome
>["name"];

export type RoleBasedButtonsConfig = {
  civilian: NavigationButtonConfig[];
  responder: NavigationButtonConfig[];
  sysad: NavigationButtonConfig[];
};

import { CameraType, CameraView } from "expo-camera";
import { PostverifiedReport, PreverifiedReport, UserRole } from "./database";
import { FontAwesomeIconName } from "../type/component";
import { Video } from "expo-av";
import { TextStyle, ViewStyle } from "react-native";
import * as Location from "expo-location";

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export interface LoginBoxProps {
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
}

export interface NavigationBarProps {
  selectedPanel: string;
  setSelectedPanel: (panel: string) => void;
}

export interface ReportCardProps {
  preverified: PreverifiedReport;
  verified: PostverifiedReport | null;
  onClick: () => void;
}

export interface PersonalReportCardProps {
  userSubmittedReport: PreverifiedReport;
}

export interface SelectedReportModalProps {
  visible: boolean;
  onClose: () => void;
  selectedReport: [PreverifiedReport, PostverifiedReport | null] | null;
}

export interface CameraPanelProps {
  cameraRef: React.RefObject<CameraView>;
  videoRef: React.RefObject<Video>;
  facing: CameraType;
  setFacing: (type: CameraType) => void;
  isRecording: boolean;
  isVideoMode: boolean;
  toggleMediaType: () => void;
  handleTakePhoto: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  recordingDuration: number;
  handleGoBack: () => void;
}

export interface SubmissionPanelProps {
  isLoading: boolean;
  isSubmissionSending: boolean;
  isSubmissionSuccessVisible: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmissionSending: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSubmissionSuccessVisible: React.Dispatch<React.SetStateAction<boolean>>;
  getFullName: () => string;
  formatAddress: (addr: any) => string;
  address: any;
  coords: { latitude: number; longitude: number } | null;
  timestamp: string;
  setAddress: React.Dispatch<
    React.SetStateAction<Location.LocationGeocodedAddress | null>
  >;
  setCoords: React.Dispatch<
    React.SetStateAction<{
      latitude: number;
      longitude: number;
    } | null>
  >;
  setTimestamp: React.Dispatch<React.SetStateAction<string>>;
  onBackPress: () => void;
  onSubmitPress: () => void;
  onCloseSuccessModal: () => void;
}

export interface TopControlProps {
  isRecording: boolean;
  duration: number;
  isVideoMode: boolean;
  onToggleMode: () => void;
}

export interface BottomControlProps {
  isRecording: boolean;
  isVideoMode: boolean;
  onRecord: () => void;
  onFlipCamera: () => void;
  onBack: () => void;
  onCapturePhoto?: () => void;
}

export interface ReportHelpModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface NavigationButtonProps {
  iconName: FontAwesomeIconName;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  isCamera?: boolean;
  styled?: ViewStyle;
}

// Add this to your types/interfaces file
export interface NavigationButtonConfig {
  iconName: FontAwesomeIconName;
  label: string;
  panel: string;
  isCamera?: boolean;
  subItems?: Array<{
    iconName: FontAwesomeIconName;
    label: string;
    panel: string;
  }>;
}

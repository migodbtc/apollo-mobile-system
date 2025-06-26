import type {
  ReportStatus,
  ResponseStatus,
  SeverityLevel,
  SpreadPotential,
  UserRole,
} from "./types";

export type FireStatistic = {
  FS_statistic_id: number;
  FS_last_update: string;
  FS_total_fires: number;
  FS_false_alarms: number;
  FS_detected_fires: number;
  FS_average_confidence: number;
};

export type PostverifiedReport = {
  VR_verification_id: number;
  VR_report_id: number;
  VR_confidence_score: number;
  VR_detected: boolean;
  VR_verification_timestamp: string;
  VR_severity_level?: SeverityLevel;
  VR_spread_potential?: SpreadPotential;
  VR_fire_type?: string;
};

export type PreverifiedReport = {
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

export type ResponseLog = {
  RL_response_id: number;
  RL_verified_report_id: number;
  RL_response_time: string;
  RL_response_status: ResponseStatus;
};

export type UserAccount = {
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

export type MediaStorage = {
  MS_media_id: number;
  MS_user_owner: number;
  MS_file_type: string;
  MS_file_name: string;
  MS_file_data: Blob | ArrayBuffer | string;
};

export type CombinedReport = [PreverifiedReport, PostverifiedReport | null];

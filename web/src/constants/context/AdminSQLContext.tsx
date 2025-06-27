import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import type {
  CombinedReport,
  FireStatistic,
  MediaStorage,
  PostverifiedReport,
  PreverifiedReport,
  ResponseLog,
  UserAccount,
} from "../types/database";

/**
 * Represents the state structure for the database context
 * including all tables and their loading/error states
 */
interface AdminSQLState {
  fireStatistics: FireStatistic[];
  postverifiedReports: PostverifiedReport[];
  preverifiedReports: PreverifiedReport[];
  responseLogs: ResponseLog[];
  userAccounts: UserAccount[];
  mediaStorage: MediaStorage[];
  combinedReports: CombinedReport[];
  loading: {
    fireStatistics: boolean;
    postverifiedReports: boolean;
    preverifiedReports: boolean;
    responseLogs: boolean;
    userAccounts: boolean;
    mediaStorage: boolean;
  };
  errors: {
    fireStatistics: string | null;
    postverifiedReports: string | null;
    preverifiedReports: string | null;
    responseLogs: string | null;
    userAccounts: string | null;
    mediaStorage: string | null;
  };
}

/**
 * Defines the context API surface including all state values
 * and available methods for interacting with the database
 */
interface AdminSQLContextProps extends AdminSQLState {
  /** Fetches latest fire statistics data */
  fetchFireStatistics: () => Promise<void>;
  /** Fetches latest postverified reports */
  fetchPostverifiedReports: () => Promise<void>;
  /** Fetches latest preverified reports */
  fetchPreverifiedReports: () => Promise<void>;
  /** Fetches latest response logs */
  fetchResponseLogs: () => Promise<void>;
  /** Fetches latest user accounts */
  fetchUserAccounts: () => Promise<void>;
  fetchMediaStorageDetails: () => Promise<void>;
  /** Fetches media storage row by its ID */
  fetchMediaById: (id: number) => Promise<void>;
  /** Merges preverified and postverified reports */
  combineReports: () => void;
  /** Refreshes all data tables simultaneously */
  refreshAll: () => Promise<void>;
  /** Finds a preverified report by its ID */
  getPreverifiedReportById: (id: number) => PreverifiedReport | undefined;
  /** Finds a postverified report by its ID */
  getPostverifiedReportById: (id: number) => PostverifiedReport | undefined;
  /** Finds a user account by its ID */
  getUserAccountById: (id: number) => UserAccount | undefined;
  fetchMediaBlobById: (id: number) => Promise<any>;
}

/**
 * The React context instance for the Admin SQL database
 */
const AdminSQLContext = createContext<AdminSQLContextProps | undefined>(
  undefined
);

/**
 * Provider component that manages database state and provides
 * data access methods to child components
 *
 * @param children - React child components that will consume the context
 */
export const AdminSQLProvider = ({
  children,
  serverUrl,
}: {
  children: React.ReactNode;
  serverUrl: string;
}) => {
  const api = useMemo(
    () =>
      axios.create({
        baseURL: serverUrl.replace(/\/+$/, ""),
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    [serverUrl]
  );

  const [state, setState] = useState<AdminSQLState>({
    fireStatistics: [],
    postverifiedReports: [],
    preverifiedReports: [],
    responseLogs: [],
    userAccounts: [],
    mediaStorage: [],
    combinedReports: [],
    loading: {
      fireStatistics: false,
      postverifiedReports: false,
      preverifiedReports: false,
      responseLogs: false,
      userAccounts: false,
      mediaStorage: false,
    },
    errors: {
      fireStatistics: null,
      postverifiedReports: null,
      preverifiedReports: null,
      responseLogs: null,
      userAccounts: null,
      mediaStorage: null,
    },
  });

  /**
   * Generic data fetching function that handles loading states and errors
   *
   * @param tableName - Key of the table to update in state
   * @param endpoint - API endpoint to fetch data from
   * @template T - Type of the data being fetched
   */
  const fetchData = useCallback(
    async <T,>(tableName: keyof AdminSQLState, endpoint: string) => {
      try {
        // console.log(
        //   `[API Request] Preparing to fetch ${tableName}:`,
        //   `\n- Full URL: ${api.defaults.baseURL}/${endpoint}`,
        //   `\n- Method: GET`,
        //   `\n- Headers: ${JSON.stringify(api.defaults.headers, null, 2)}`
        // );

        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [tableName]: true },
          errors: { ...prev.errors, [tableName]: null },
        }));

        const response = await api.get<T[]>(`/${endpoint}`);
        setState((prev) => ({
          ...prev,
          [tableName]: response.data,
          loading: { ...prev.loading, [tableName]: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, [tableName]: false },
          errors: {
            ...prev.errors,
            [tableName]:
              error instanceof Error ? error.message : "Unknown error",
          },
        }));
        console.error(`Error fetching ${tableName}:`, error);
      }
    },
    [api]
  );

  // Individual table fetch methods
  const fetchFireStatistics = useCallback(
    () => fetchData<FireStatistic>("fireStatistics", "fire-statistics"),
    [fetchData]
  );

  const fetchPostverifiedReports = useCallback(
    () =>
      fetchData<PostverifiedReport>(
        "postverifiedReports",
        "reports/postverified/all"
      ),
    [fetchData]
  );

  // modified to autoconvert coordinates from str to number
  const fetchPreverifiedReports = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, preverifiedReports: true },
        errors: { ...prev.errors, preverifiedReports: null },
      }));

      const response = await api.get<PreverifiedReport[]>(
        "/reports/preverified/all"
      );

      const fixedData = response.data.map((item) => ({
        ...item,
        PR_latitude:
          typeof item.PR_latitude === "string"
            ? parseFloat(item.PR_latitude)
            : item.PR_latitude,
        PR_longitude:
          typeof item.PR_longitude === "string"
            ? parseFloat(item.PR_longitude)
            : item.PR_longitude,
      }));

      setState((prev) => ({
        ...prev,
        preverifiedReports: fixedData,
        loading: { ...prev.loading, preverifiedReports: false },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, preverifiedReports: false },
        errors: {
          ...prev.errors,
          preverifiedReports:
            error instanceof Error ? error.message : "Unknown error",
        },
      }));
      console.error(`Error fetching preverifiedReports:`, error);
    }
  }, [api]);

  const fetchResponseLogs = useCallback(
    () => fetchData<ResponseLog>("responseLogs", "response-logs"),
    [fetchData]
  );

  const fetchUserAccounts = useCallback(
    () => fetchData<UserAccount>("userAccounts", "user/get/all"),
    [fetchData]
  );

  const fetchMediaStorageDetails = useCallback(
    () => fetchData<MediaStorage>("mediaStorage", "media/details/get/all"),
    [fetchData]
  );

  /**
   * Fetches a single media item by ID and caches it
   * @param id - The MS_media_id to fetch
   */
  const fetchMediaById = useCallback(
    async (id: number) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, mediaStorage: true },
          errors: { ...prev.errors, mediaStorage: null },
        }));

        const response = await api.get<MediaStorage>(`/media/${id}`);
        setState((prev) => ({
          ...prev,
          mediaStorage: {
            ...prev.mediaStorage,
            [id]: response.data,
          },
          loading: { ...prev.loading, mediaStorage: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, mediaStorage: false },
          errors: {
            ...prev.errors,
            mediaStorage:
              error instanceof Error ? error.message : "Unknown error",
          },
        }));
        console.error(`Error fetching media ${id}:`, error);
      }
    },
    [api]
  );

  /**
   * Combines preverified and postverified reports into a single array
   * where each entry is [PreverifiedReport, PostverifiedReport | null]
   */
  const combineReports = useCallback(() => {
    const combined = state.preverifiedReports.map((preReport) => {
      const postReport =
        state.postverifiedReports.find(
          (post) => post.VR_report_id === preReport.PR_report_id
        ) || null;
      return [preReport, postReport] as CombinedReport;
    });

    setState((prev) => ({
      ...prev,
      combinedReports: combined,
    }));
  }, [state.preverifiedReports, state.postverifiedReports]);

  // Remove combinedReports from AdminSQLState and setState
  const combinedReports = useMemo(() => {
    return state.preverifiedReports.map((preReport) => {
      const postReport =
        state.postverifiedReports.find(
          (post) => post.VR_report_id === preReport.PR_report_id
        ) || null;
      return [preReport, postReport] as CombinedReport;
    });
  }, [state.preverifiedReports, state.postverifiedReports]);

  useEffect(() => {
    if (state.preverifiedReports.length > 0) {
      combineReports();
    }
  }, [state.preverifiedReports, state.postverifiedReports, combineReports]);

  /**
   * Refreshes all data tables by making parallel requests
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      // fetchFireStatistics(),
      fetchPostverifiedReports(),
      fetchPreverifiedReports(),
      // fetchResponseLogs(),
      fetchUserAccounts(),
      fetchMediaStorageDetails(),
    ]);
  }, [
    // fetchFireStatistics,
    fetchPostverifiedReports,
    fetchPreverifiedReports,
    // fetchResponseLogs,
    fetchUserAccounts,
    fetchMediaStorageDetails,
  ]);

  /**
   * Finds a preverified report by its ID
   *
   * @param id - The PR_report_id to search for
   * @returns The matching report or undefined if not found
   */
  const getPreverifiedReportById = useCallback(
    (id: number) => {
      return state.preverifiedReports.find(
        (report) => report.PR_report_id === id
      );
    },
    [state.preverifiedReports]
  );

  /**
   * Finds a postverified report by its ID
   *
   * @param id - The VR_report_id to search for
   * @returns The matching report or undefined if not found
   */
  const getPostverifiedReportById = useCallback(
    (id: number) => {
      return state.postverifiedReports.find(
        (report) => report.VR_report_id === id
      );
    },
    [state.postverifiedReports]
  );

  /**
   * Finds a user account by its ID
   *
   * @param id - The UA_user_id to search for
   * @returns The matching user or undefined if not found
   */
  const getUserAccountById = useCallback(
    (id: number) => {
      return state.userAccounts.find((user) => user.UA_user_id === id);
    },
    [state.userAccounts]
  );

  /**
   * Finds a media storage item by its ID
   *
   * @param id - The MS_media_id to search for
   * @returns The matching media item or undefined if not found
   */
  const fetchMediaBlobById = useCallback(
    async (id: number) => {
      try {
        const response = await api.post(
          "media/blob/get/one",
          {
            MS_media_id: id,
          },
          { responseType: "blob" }
        );
        const blob = response.data;
        return blob;
      } catch (error) {
        console.error(`Error fetching media blob for id ${id}:`, error);
        return undefined;
      }
    },
    [api]
  );

  return (
    <AdminSQLContext.Provider
      value={{
        ...state,
        combinedReports,
        fetchFireStatistics,
        fetchPostverifiedReports,
        fetchPreverifiedReports,
        fetchResponseLogs,
        fetchUserAccounts,
        fetchMediaStorageDetails,
        fetchMediaById,
        combineReports,
        refreshAll,
        getPreverifiedReportById,
        getPostverifiedReportById,
        getUserAccountById,
        fetchMediaBlobById,
      }}
    >
      {children}
    </AdminSQLContext.Provider>
  );
};

/**
 * Hook for accessing the Admin SQL database context
 *
 * @returns The AdminSQLContextProps object with all state and methods
 * @throws Error if used outside of an AdminSQLProvider
 */
export const useAdminSQL = () => {
  const context = useContext(AdminSQLContext);
  if (!context) {
    throw new Error("useAdminSQL must be used within an AdminSQLProvider");
  }
  return context;
};

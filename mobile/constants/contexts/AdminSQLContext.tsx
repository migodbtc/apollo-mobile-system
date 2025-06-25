import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import {
  CombinedReport,
  FireStatistic,
  MediaStorage,
  PostverifiedReport,
  PreverifiedReport,
  ResponseLog,
  UserAccount,
} from "../types/database";
import SERVER_LINK from "../netvar";

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
  combinedReports: CombinedReport[] | null;
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
  serverUrl = SERVER_LINK,
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

  const fetchPreverifiedReports = useCallback(
    () =>
      fetchData<PreverifiedReport>(
        "preverifiedReports",
        "reports/preverified/all"
      ),
    [fetchData]
  );

  const fetchResponseLogs = useCallback(
    () => fetchData<ResponseLog>("responseLogs", "response-logs"),
    [fetchData]
  );

  const fetchUserAccounts = useCallback(
    () => fetchData<UserAccount>("userAccounts", "user/get/all"),
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

  // Call combineReports whenever the source reports change
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
    ]);
  }, [
    // fetchFireStatistics,
    fetchPostverifiedReports,
    fetchPreverifiedReports,
    // fetchResponseLogs,
    fetchUserAccounts,
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

  // Initial data load - fetches essential data on first render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchData<PreverifiedReport>(
            "preverifiedReports",
            "reports/preverified/all"
          ),
          fetchData<UserAccount>("userAccounts", "user/get/all"),
        ]);
      } catch (error) {
        console.error("Initial data load failed:", error);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array - runs once on mount

  return (
    <AdminSQLContext.Provider
      value={{
        ...state,
        fetchFireStatistics: () =>
          fetchData<FireStatistic>("fireStatistics", "fire-statistics"),
        fetchPostverifiedReports: () =>
          fetchData<PostverifiedReport>(
            "postverifiedReports",
            "reports/postverified/all"
          ),
        fetchPreverifiedReports: () =>
          fetchData<PreverifiedReport>(
            "preverifiedReports",
            "reports/preverified/all"
          ),
        fetchResponseLogs: () =>
          fetchData<ResponseLog>("responseLogs", "response-logs"),
        fetchUserAccounts: () =>
          fetchData<UserAccount>("userAccounts", "user/get/all"),
        fetchMediaById,
        combineReports,
        refreshAll: async () => {
          await Promise.all([
            // fetchData<FireStatistic>("fireStatistics", "fire-statistics"), // Disabled
            fetchData<PostverifiedReport>(
              "postverifiedReports",
              "reports/postverified/all"
            ),
            fetchData<PreverifiedReport>(
              "preverifiedReports",
              "reports/preverified/all"
            ),
            // fetchData<ResponseLog>("responseLogs", "response-logs"), // Disabled
            fetchData<UserAccount>("userAccounts", "user/get/all"),
          ]);
        },
        getPreverifiedReportById,
        getPostverifiedReportById,
        getUserAccountById,
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

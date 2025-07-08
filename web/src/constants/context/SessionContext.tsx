import React, { createContext, useState, useContext } from "react";
import type { UserSession } from "../interfaces/interface";

type SessionContextType = {
  sessionData: UserSession | null;
  setSessionData: React.Dispatch<React.SetStateAction<UserSession | null>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionData, setSessionData] = useState<UserSession | null>(null);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

import React, { createContext, useState, useContext } from "react";
import { UserAccount, UserSession } from "../interfaces/database";

type SessionContextType = {
  sessionData: UserSession | null;
  setSessionData: React.Dispatch<React.SetStateAction<UserSession | null>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const sampleSession: UserSession = {
    UA_user_id: 13,
    UA_username: "responder.alec",
    UA_password: "~~~~~~~~",
    UA_user_role: "responder",
    UA_created_at: "2025-04-15 22:08:06",
    UA_last_name: "Eigenmann",
    UA_first_name: "Alec Theodore",
    UA_middle_name: "Yongco",
    UA_suffix: "III",
    UA_email_address: "alex.respondeer@example.com",
    UA_phone_number: "(+63) 978-812-4522",
    UA_reputation_score: 0,
  };

  const [sessionData, setSessionData] = useState<UserSession | null>(
    sampleSession
  );

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

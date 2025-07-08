import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface HermesContextType {
  toggleValidation: boolean;
  setToggleValidation: React.Dispatch<React.SetStateAction<boolean>>;
  uptime: number;
  setUptime: React.Dispatch<React.SetStateAction<number>>;
}

const HermesContext = createContext<HermesContextType | undefined>(undefined);

export const HermesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toggleValidation, setToggleValidation] = useState<boolean>(false);
  const [uptime, setUptime] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (toggleValidation) {
      intervalRef.current = window.setInterval(() => {
        setUptime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [toggleValidation]);

  return (
    <HermesContext.Provider
      value={{ toggleValidation, setToggleValidation, uptime, setUptime }}
    >
      {children}
    </HermesContext.Provider>
  );
};

export const useHermes = () => {
  const context = useContext(HermesContext);
  if (!context) {
    throw new Error("useHermes must be used within a HermesProvider");
  }
  return context;
};

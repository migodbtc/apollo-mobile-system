import React, { createContext, useState, useContext } from "react";

type VideoUriContextType = {
  videoUri: string | null;
  setVideoUri: React.Dispatch<React.SetStateAction<string | null>>;
};

const VideoUriContext = createContext<VideoUriContextType | undefined>(
  undefined
);

export const VideoUriProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);

  return (
    <VideoUriContext.Provider value={{ videoUri, setVideoUri }}>
      {children}
    </VideoUriContext.Provider>
  );
};

export const useVideoUri = () => {
  const context = useContext(VideoUriContext);
  if (!context) {
    throw new Error("useVideoUri must be used within a VideoUriProvider");
  }
  return context;
};

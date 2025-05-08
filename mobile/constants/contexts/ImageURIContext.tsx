import React, { createContext, useState, useContext } from "react";

type ImageUriContextType = {
  imageUri: string | null;
  setImageUri: React.Dispatch<React.SetStateAction<string | null>>;
};

const ImageUriContext = createContext<ImageUriContextType | undefined>(
  undefined
);

export const ImageUriProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  return (
    <ImageUriContext.Provider value={{ imageUri, setImageUri }}>
      {children}
    </ImageUriContext.Provider>
  );
};

export const useImageUri = () => {
  const context = useContext(ImageUriContext);
  if (!context) {
    throw new Error("useImageUri must be used within an ImageUriProvider");
  }
  return context;
};

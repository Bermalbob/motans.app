import React, { createContext, useContext } from "react";

type SplashContextType = {
  showSplash: () => void;
};

const SplashContext = createContext<SplashContextType | undefined>(undefined);

type SplashProviderProps = {
  children: React.ReactNode;
  onShowSplash: () => void;
};

export const SplashProvider: React.FC<SplashProviderProps> = ({
  children,
  onShowSplash,
}) => {
  return (
    <SplashContext.Provider value={{ showSplash: onShowSplash }}>
      {children}
    </SplashContext.Provider>
  );
};

export const useSplash = (): SplashContextType => {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error("useSplash debe usarse dentro de SplashProvider");
  }
  return context;
};

import React, { createContext, useState, useContext, ReactNode } from "react";

interface ExpenseContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ExpenseContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseRefresh = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenseRefresh must be used within ExpenseProvider");
  }
  return context;
};

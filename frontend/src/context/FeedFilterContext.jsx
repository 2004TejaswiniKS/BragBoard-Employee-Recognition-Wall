import { createContext, useState } from "react";

export const FeedFilterContext = createContext();

export function FeedFilterProvider({ children }) {
  const [filter, setFilter] = useState({
    type: "all",
    department: null,
    label: "All Departments"
  });

  // ✅ RESET FILTER TO DEFAULT
  const resetFilter = () => {
    setFilter({
      type: "all",
      department: null,
      label: "All Departments"
    });
  };

  return (
    <FeedFilterContext.Provider
      value={{ filter, setFilter, resetFilter }}
    >
      {children}
    </FeedFilterContext.Provider>
  );
}

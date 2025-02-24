import React, { createContext, useState,ReactNode } from 'react';

interface SearchContextType {
    activePage: 'students' | 'staff'|'payroll'|'admin-attendance-mangement'|'admin-leave-management'|'/d'|'mark-attendance'|'fee';
    setActivePage: (page: 'students' | 'staff'|'payroll'|'admin-attendance-mangement'|'admin-leave-management'|'/d'|'mark-attendance'|'fee') => void;
  }

  export const SearchContext = createContext<SearchContextType | undefined>(undefined);

  interface SearchProviderProps {
    children: ReactNode;
  }
  
  export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [activePage, setActivePage] = useState<'students' | 'staff'|'payroll'|'admin-attendance-mangement'|'admin-leave-management'|'/d'|'mark-attendance'|'fee'>('/d');
  
    return (
      <SearchContext.Provider value={{ activePage, setActivePage }}>
        {children}
      </SearchContext.Provider>
    );
  };
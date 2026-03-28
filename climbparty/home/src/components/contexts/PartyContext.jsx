// 📁 src/components/contexts/PartyContext.jsx
import React, { createContext, useContext, useState } from "react";

// 1. Context 생성
const PartyContext = createContext();

// 2. Provider 컴포넌트 정의
export function PartyProvider({ children }) {
  const [currentParty, setCurrentParty] = useState(null);

  return (
    <PartyContext.Provider value={{ currentParty, setCurrentParty }}>
      {children}
    </PartyContext.Provider>
  );
}

// 3. Hook으로 Context 사용
export function usePartyContext() {
  return useContext(PartyContext);
}

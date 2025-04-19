// 📁 src/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [agreed, setAgreed] = useState(null); // ✅ 추가
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setAgreed(data.agreed || false); // ✅ 약관 동의 상태 저장
          } else {
            setAgreed(false); // 문서 없으면 동의 안 한 것으로 간주
          }
        } catch (error) {
          console.error("Firestore agreed 상태 불러오기 실패:", error);
          setAgreed(false);
        }
      } else {
        setUser(null);
        setAgreed(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAgreed(null);
  };

  return (
    <AuthContext.Provider value={{ user, agreed, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

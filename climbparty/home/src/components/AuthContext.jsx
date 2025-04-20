// 📁 src/components/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstCheckDone, setFirstCheckDone] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserRole(null);
      } else {
        try {
          setUser(firebaseUser);
          const userRef = doc(db, "users", firebaseUser.uid);
          const snapshot = await getDoc(userRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserRole(data.role || "user");
          } else {
            setUserRole("user");
          }
        } catch (err) {
          setUser(null);
          setUserRole(null);
        }
      }

      setLoading(false);
      setFirstCheckDone(true);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, logout, loading, firstCheckDone }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

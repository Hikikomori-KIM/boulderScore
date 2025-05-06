// 📁 src/components/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase"; //Firebase 인증과 DB객체
import { onAuthStateChanged, signOut } from "firebase/auth"; //인증 상태 확인 및 로그아웃
import { doc, getDoc } from "firebase/firestore";// firestore 문서 불러오기

const AuthContext = createContext(); //전역으로 로그인 정보를 공유할 수 있는 context 생성

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); //현제 로그인한 유저 정보
  const [userRole, setUserRole] = useState(null); //firestore의 role 필드값 사용자 권한
  const [loading, setLoading] = useState(true); // 인증 상태 확인 중 로딩 여부
  const [firstCheckDone, setFirstCheckDone] = useState(false); //첫 로그인 확인이 끝났는지 여부 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => { //firebase에서 로그인/로그아웃 등의 인증 상태가 변경되었을 때 자동 감지
      if (!firebaseUser) {
        setUser(null);
        setUserRole(null);
      } else {
        try {
          setUser(firebaseUser); //firebase 유저 정보 저장
          const userRef = doc(db, "users", firebaseUser.uid); 
          const snapshot = await getDoc(userRef); //firebase의 users/{uid}문서 가져오기

          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserRole(data.role || "user"); //role이 없으면 기본값은 "user"
          } else {
            setUserRole("user"); //문서가 없으면 기본값
          }
        } catch (err) { //에러발생시 초기화
          setUser(null);
          setUserRole(null);
        }
      }

      setLoading(false); //로딩 끝
      setFirstCheckDone(true); //첫 확인 완료
    });

    return () => unsubscribe(); //나중에 이벤트 리스너 정리
  }, []);

  const logout = async () => {
    await signOut(auth); //firebase 로그아웃
    setUser(null); //상태 초기화
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

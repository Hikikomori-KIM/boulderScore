import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  updateDoc,
  doc,
  getDoc,
  onSnapshot, // ✅ 실시간 반영
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 역할 표시용 매핑
const ROLE_LABEL = {
  superadmin: "관리자",
  admin: "운영자",
  user: "일반회원",
};

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // 현재 로그인한 사용자의 role 조회
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const myDocRef = doc(db, "users", user.uid);
        const myDocSnap = await getDoc(myDocRef);
        if (myDocSnap.exists()) {
          setCurrentUserRole(myDocSnap.data().role);
        }
      }
    };
    fetchCurrentUserRole();
  }, []);

  // 실시간 유저 목록 가져오기
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });

    return () => unsubscribe(); // 언마운트 시 구독 해제
  }, []);

  // 역할 변경 (운영자/일반회원만 변경 가능)
  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    // 실시간 반영이므로 setUsers는 따로 안 써도 됨
  };

  // 🔍 검색 필터링된 유저 목록
  const filteredUsers = users.filter((user) => {
    const keyword = searchText.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(keyword) ||
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-3">회원 역할 관리</h2>

      {/* 🔍 검색창 */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="이름 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>이름</th>
            <th>이메일</th>
            <th>현재 역할</th>
            <th>변경</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.displayName || user.name || "이름 없음"}</td>
              <td>{user.email}</td>
              <td>{ROLE_LABEL[user.role] || user.role}</td>
              <td>
                {user.role === "superadmin" ? (
                  <span className="text-muted">변경 불가</span>
                ) : currentUserRole === "superadmin" ? (
                  <select
                    className="form-select"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value)
                    }
                  >
                    <option value="user">일반회원</option>
                    <option value="admin">운영자</option>
                  </select>
                ) : (
                  <span className="text-muted">권한 없음</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

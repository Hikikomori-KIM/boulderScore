import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // 현재 로그인한 사용자의 role 확인
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDocs(collection(db, "users"));
        const myInfo = userDoc.docs.find((d) => d.id === user.uid);
        if (myInfo) {
          const data = myInfo.data();
          setCurrentUserRole(data.role);
        }
      }
    };
    fetchCurrentUserRole();
  }, []);

  // 전체 유저 불러오기
  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const userList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(userList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
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
              <td>{user.role}</td>
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
                    <option value="admin">관리자</option>
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

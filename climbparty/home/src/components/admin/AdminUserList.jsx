import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ROLE_LABEL = {
  superadmin: "관리자",
  admin: "운영자",
  user: "일반회원",
};

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchText.toLowerCase();
    return (
      user.displayName?.toLowerCase().includes(keyword) ||
      user.name?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal, bVal;

    if (sortKey === "name") {
      aVal = a.displayName || a.name || "";
      bVal = b.displayName || b.name || "";
    } else if (sortKey === "email") {
      aVal = a.email;
      bVal = b.email;
    } else if (sortKey === "role") {
      const rolePriority = { superadmin: 0, admin: 1, user: 2 };
      aVal = rolePriority[a.role] ?? 3;
      bVal = rolePriority[b.role] ?? 3;
    } else if (sortKey === "createdAt") {
      aVal = a.createdAt?.seconds || 0;
      bVal = b.createdAt?.seconds || 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  return (
    <div className="container mt-4">
      <h2 className="mb-3">회원 역할 관리</h2>

      <div className="mb-3 d-flex gap-2 align-items-center flex-wrap">
        <input
          type="text"
          className="form-control"
          placeholder="이름 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <select
          className="form-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          style={{ maxWidth: "160px" }}
        >
          <option value="name">이름순</option>
          <option value="email">이메일순</option>
          <option value="role">역할순</option>
          <option value="createdAt">가입일순</option> {/* ✅ 추가 */}
        </select>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "▲" : "▼"}
        </button>
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
          {sortedUsers.map((user) => (
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
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
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

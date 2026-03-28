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
import "./AdminUserList.css"; // ✅ 추가된 스타일 import

const ROLE_LABEL = {
  superadmin: "관리자",
  admin: "운영자",
  user: "일반회원",
};
const formatDate = (timestamp) => {
  if (!timestamp?.seconds) return "-";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
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
    <div className="container py-4">
      <h3 className="fw-bold mb-4">👥 회원 역할 관리</h3>

      <div className="bg-light rounded shadow-sm p-3 mb-4 d-flex flex-wrap gap-2 align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="이름 또는 이메일 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: "280px" }}
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
          <option value="createdAt">가입일순</option>
        </select>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          title="정렬 방향 전환"
        >
          {sortOrder === "asc" ? "▲" : "▼"}
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle table-bordered shadow-sm rounded">
          <thead className="table-light">
            <tr>
              <th className="d-none d-md-table-cell">가입일</th>
              <th>이름</th>
              <th>이메일</th>
              <th>현재 역할</th>
              <th>변경</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id}>
                <td className="d-none d-md-table-cell">
                  {formatDate(user.createdAt)}
                </td>
                <td>{user.displayName || user.name || "이름 없음"}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge role-badge ${user.role}`}>
                    {ROLE_LABEL[user.role]}
                  </span>
                </td>
                <td>
                  {user.role === "superadmin" ? (
                    <span className="text-muted">변경 불가</span>
                  ) : currentUserRole === "superadmin" ? (
                    <select
                      className="form-select form-select-sm"
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
    </div>
  );
}

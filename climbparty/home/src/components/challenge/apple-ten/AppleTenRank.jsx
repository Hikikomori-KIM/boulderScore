import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";
// import "./AppleTenRank.css";

export default function AppleTenRank() {
  const [records, setRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const ref = collection(db, "appleTenRecords");
      const q = query(ref, orderBy("score", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(data);
    };

    fetchRecords();

    const user = getAuth().currentUser;
    setCurrentUser(user);
  }, []);

  return (
    <div className="ranking-wrapper">
      <h2 className="ranking-title">🍏 Apple 10 랭킹</h2>
      <h3 className="ranking-subtitle">🏆 TOP 5</h3>

      <div className="top5-list">
        {records.slice(0, 5).map((record, index) => (
          <div
            className={`rank-card ${index === 0 ? "first-place" : index === 1 ? "second-place" : index === 2 ? "third-place" : ""}`}
            key={record.id}
          >
            <div className="badge-area">
              <span className="badge-emoji">
                {index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </span>
              <span className="rank-label">{index + 1}위</span>
            </div>
            <div className="rank-content">
              <div className="rank-name">{record.name}</div>
              <div className="rank-score">{record.score}점</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="ranking-subtitle">📋 전체 랭킹</h3>

      <div className="table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const isCurrentUser = currentUser && record.id === currentUser.uid;
              return (
                <tr
                  key={record.id}
                  className={`${index < 5 ? "highlight" : ""} ${isCurrentUser ? "my-record" : ""}`}
                >
                  <td>{index + 1}</td>
                  <td>{record.name}</td>
                  <td>{record.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

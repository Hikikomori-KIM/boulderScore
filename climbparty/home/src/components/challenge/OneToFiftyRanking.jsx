import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "./OneToFiftyRanking.css";

export default function OneToFiftyRanking() {
  const [records, setRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const ref = collection(db, "oneToFiftyRecords");
      const q = query(ref, orderBy("bestTime", "asc"));
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
      <h2 className="ranking-title">🏆 TOP 5 챌린저</h2>
      <div className="top10-grid">
        {records.slice(0, 5).map((record, index) => (
          <div
            className={`card modern-glass ${
              index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "default"
            }`}
            key={record.id}
          >
            <div className="rank-badge">
              {index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : `${index + 1}위`}
            </div>
            <div className="card-name">{record.name}</div>
            <div className="card-time">{record.bestTime.toFixed(2)}초</div>
          </div>
        ))}
      </div>

      <h3 className="ranking-subtitle">전체 랭킹</h3>
      <div className="table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>기록 (초)</th>
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
                  <td>{record.bestTime.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

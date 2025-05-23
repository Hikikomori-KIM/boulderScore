import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "./OneToFiftyRanking.css";

export default function OneToFiftyRanking() {
  const [records, setRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const prizes = [
    { rank: 1, item: "딥퍼랑스 핸드크림", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1745889618/1%EB%93%B1%EC%83%81%ED%92%88_ca7qdt.jpg" },
    { rank: 2, item: "스타벅스 기프티콘", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1745889612/2%EB%93%B1%EC%83%81%ED%92%88_cxohzy.jpg" },
    { rank: 3, item: "베스킨라빈스 싱글콘", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1745889614/3%EB%93%B1%EC%83%81%ED%92%88_l4y9eb.jpg" },
    { rank: 4, item: "테니스 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977863/%ED%99%94%EB%A9%B4_%EC%BA%A1%EC%B2%98_2025-05-23_142411_vei0zq.png" },
    { rank: 5, item: "야구 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977817/da4483918ad31b4c14807a071c8b5c9b_fxowqm.jpg" },
    { rank: 6, item: "배드민턴 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977809/2fca22958c420d46efc13a4427850f2c_vdfnvt.jpg" },
  ];

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
      <h2 className="fw-bold">6월6일 00시마감 </h2>
      <div className="top5-list">
        {records.slice(0, 5).map((record, index) => (
          <div
            className={`rank-card ${index === 0 ? "first-place" : index === 1 ? "second-place" : index === 2 ? "third-place" : ""
              }`}
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
              <div className="rank-time">{record.bestTime.toFixed(2)}초</div>
            </div>
          </div>
        ))}
      </div>

      {/* 상품 안내 섹션 */}
      <h3 className="ranking-subtitle">🎁 상품 안내</h3>

      <div className="prize-list">
        {prizes.map((prize) => (
          <div className="prize-card" key={prize.rank}>
            <div className="prize-rank">
              {prize.rank === 1
                ? "🥇 1등"
                : prize.rank === 2
                  ? "🥈 2등"
                  : prize.rank === 3
                    ? "🥉 3등"
                    : `${prize.rank}등`}
            </div>
            <img src={prize.image} alt={prize.item} className="prize-img" />
            <div className="prize-item">{prize.item}</div>
          </div>
        ))}
      </div>

      {/* 전체 랭킹 테이블 */}
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

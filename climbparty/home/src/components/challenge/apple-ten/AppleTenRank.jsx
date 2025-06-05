import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import { getAuth } from "firebase/auth";
// import "./AppleTenRank.css";

export default function AppleTenRank() {
  const [records, setRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const prizes = [
    { rank: 1, item: "그랩댓 홀드 솔", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747039876/%EA%B7%B8%EB%9E%A9%EB%8C%93_vnrrao.png" },
    { rank: 2, item: "5000 보조배터리", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747038395/2%EB%B2%88%EC%A7%B8_%EA%B2%8C%EC%9E%84_%EC%83%81%ED%92%88_dmhvyj.png" },
    { rank: 3, item: "5000 보조배터리", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747038395/2%EB%B2%88%EC%A7%B8_%EA%B2%8C%EC%9E%84_%EC%83%81%ED%92%88_dmhvyj.png" },
    { rank: 4, item: "스포츠 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977863/%ED%99%94%EB%A9%B4_%EC%BA%A1%EC%B2%98_2025-05-23_142411_vei0zq.png" },
    { rank: 5, item: "스포츠 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977817/da4483918ad31b4c14807a071c8b5c9b_fxowqm.jpg" },
    { rank: 6, item: "스포츠 키링", image: "https://res.cloudinary.com/dmo7zcfxw/image/upload/v1747977809/2fca22958c420d46efc13a4427850f2c_vdfnvt.jpg" },


  ];

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
      <h2 className="fw-bold">6월6일 00시마감 </h2>
      <h4>1등 동점자 생기면 룰 추가! or</h4>
      <h4>상품 분배 사다리 타기</h4>

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

import React from "react";
import { useParams, Link } from "react-router-dom";
import ColorRanking from "../ColorRanking";
import OverallRanking from "../OverallRanking";

export default function RoomRankingsPage() {
  const { roomId } = useParams();

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">전체 랭킹</h3>
        <Link to={`/rooms/${roomId}`} className="btn btn-outline-secondary">
          ← 방으로 돌아가기
        </Link>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <ColorRanking roomId={roomId} />
        </div>
        <div className="col-12 col-lg-6">
          <OverallRanking roomId={roomId} />
        </div>
      </div>
    </div>
  );
}

// 📁 src/pages/ProjectDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function ProjectDashboard() {
    const { id: projectId } = useParams(); // ✅ useParams에서 id로 받아옴
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const ref = doc(db, "projects", projectId);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    setProject({ id: snap.id, ...snap.data() });
                }
            } catch (err) {
                console.error("프로젝트 불러오기 오류:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [projectId]);

    if (loading) return <div className="text-center mt-5">로딩 중...</div>;
    if (!project) return <div className="text-center mt-5">프로젝트를 찾을 수 없습니다.</div>;

    const go = (path) => navigate(`/project/${projectId}/${path}`);

    return (
        <div className="container py-5" style={{ maxWidth: "600px" }}>
            <h3 className="mb-4 text-center">{project.name} ⚙️</h3>

            <div className="list-group">
                <button className="list-group-item list-group-item-action" onClick={() => go("teams")}>
                    🧑‍🤝‍🧑 조 편성
                </button>
                <button className="list-group-item list-group-item-action" onClick={() => go("score-settings")}>
                    🎯 테이프별 점수 설정
                </button>
                <button className="list-group-item list-group-item-action" onClick={() => go("ranking")}>
                    🏆 전체 랭킹 (관리자용)
                </button>
                <button className="list-group-item list-group-item-action" onClick={() => go("roles")}>
                    🛡️ 권한 부여 (관리자용)
                </button>
                <button className="list-group-item list-group-item-action" onClick={() => go("scorer")}>
                    📝 채점지
                </button>
                <button className="list-group-item list-group-item-action" onClick={() => go("tape-rank")}>
                    📊 색상별 전체 랭킹
                </button>
            </div>
        </div>
    );
}

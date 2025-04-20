// components/board/boardNew.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Firebase 함수는 나중에 연결
// import { savePost } from "../../firebaseFunctions";

export default function BoardNew() {
    const navigate = useNavigate();

    const [category, setCategory] = useState("자유");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [linkedProjectId, setLinkedProjectId] = useState(""); // 선택형
    const [projectList, setProjectList] = useState([]);

    useEffect(() => {
        // 나중에 Firestore에서 프로젝트 목록 가져오기
        setProjectList([
            { id: "project1", name: "6월6일 SSS 볼파" },
        ]);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // 필수 유효성 검사
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }

        // 저장 로직 나중에 연결
        alert("게시글이 등록되었습니다!");
        navigate("/board");
    };

    return (
        <div className="container py-5" style={{ maxWidth: "720px" }}>
            <h4 className="mb-4">✍️ 글쓰기</h4>

            <form onSubmit={handleSubmit}>
                {/* 카테고리 선택 */}
                <div className="mb-3">
                    <label className="form-label">카테고리</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="자유">자유</option>
                        <option value="후기">후기</option>
                        <option value="홍보">홍보</option>
                    </select>
                </div>

                {/* 제목 입력 */}
                <div className="mb-3">
                    <label className="form-label">제목</label>
                    <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                    />
                </div>

                {/* 내용 */}
                <div className="mb-3">
                    <label className="form-label">내용</label>
                    <textarea
                        className="form-control"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={7}
                        placeholder="내용을 입력하세요"
                    ></textarea>
                </div>

                {/* 프로젝트 초대 연결 - "홍보"일 때만 보이기 */}
                {category === "홍보" && (
                    <div className="mb-4">
                        <label className="form-label">프로젝트 초대 (아직 비활성화)</label>
                        <select className="form-select" disabled>
                            <option>🔒 현재는 사용할 수 없습니다</option>
                        </select>
                        <div className="form-text text-muted">※ 이 기능은 추후 서비스화 시 활성화됩니다.</div>
                    </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/board")}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-primary">
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
}

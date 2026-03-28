import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { savePost } from "../../firebaseFunctions"; // ✅ 주석 해제
import { useAuth } from "../AuthContext"; // ✅ 로그인 유저 정보 가져오기

export default function BoardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState("자유");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState("");
  const [projectList, setProjectList] = useState([]);

  useEffect(() => {
    setProjectList([{ id: "project1", name: "6월6일 SSS 볼파" }]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const newPost = {
        title,
        content,
        category,
        author: user?.displayName || "익명",
        authorId: user?.uid || null,
        linkedProjectId: category === "홍보" ? linkedProjectId : null,
      };

      const docRef = await savePost(newPost); // ✅ Firestore에 저장
      alert("게시글이 등록되었습니다!");
      navigate(`/board/${docRef.id}`); // ✅ 상세 페이지로 이동
    } catch (err) {
      console.error("게시글 저장 실패:", err);
      alert("글 저장 중 오류가 발생했습니다.");
    }
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

        {/* 프로젝트 초대 연결 */}
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

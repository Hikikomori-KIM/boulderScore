// 📁 src/components/board/BoardEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadPostById, updatePost } from "../../firebaseFunctions";
import { useAuth } from "../AuthContext";

export default function BoardEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("자유");

  useEffect(() => {
    const fetchPost = async () => {
      const data = await loadPostById(id);
      if (!data) {
        alert("게시글이 존재하지 않습니다.");
        navigate("/board");
        return;
      }
      // 작성자만 수정 가능
      if (data.authorId !== user?.uid) {
        alert("작성자만 수정할 수 있습니다.");
        navigate(`/board/${id}`);
        return;
      }
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
    };
    fetchPost();
  }, [id, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      await updatePost(id, {
        title,
        content,
        category,
      });
      alert("게시글이 수정되었습니다.");
      navigate(`/board/${id}`);
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류 발생");
    }
  };

  if (!post) return <div className="container py-5">불러오는 중...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: "720px" }}>
      <h4 className="mb-4">✏️ 게시글 수정</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">카테고리</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="자유">자유</option>
            <option value="후기">후기</option>
            <option value="홍보">홍보</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">제목</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">내용</label>
          <textarea
            className="form-control"
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/board/${id}`)}
          >
            취소
          </button>
          <button type="submit" className="btn btn-primary">
            저장
          </button>
        </div>
      </form>
    </div>
  );
}

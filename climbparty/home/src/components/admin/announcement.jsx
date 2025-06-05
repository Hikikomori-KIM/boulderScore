import React, { useEffect, useState } from "react";
import {
  fetchAllAnnouncements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../firebaseFunctions";
import { Button, Form, Modal, Table } from "react-bootstrap";

export default function AdminAnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [active, setActive] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const loadAnnouncements = async () => {
    const data = await fetchAllAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSave = async () => {
    if (editId) {
      await updateAnnouncement(editId, {
        title: newTitle,
        content: newContent,
        active,
      });
    } else {
      await addAnnouncement({
        title: newTitle,
        content: newContent,
        active,
      });
    }
    resetForm();
    loadAnnouncements();
  };

  const resetForm = () => {
    setEditId(null);
    setNewTitle("");
    setNewContent("");
    setActive(false);
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setNewTitle(a.title);
    setNewContent(a.content);
    setActive(a.active);
  };

  const handleDelete = async () => {
    await deleteAnnouncement(deleteTargetId);
    setShowConfirm(false);
    setDeleteTargetId(null);
    loadAnnouncements();
  };

  const handleSetActive = async (targetId) => {
    // 모든 공지 active = false 처리
    for (const a of announcements) {
      if (a.active) {
        await updateAnnouncement(a.id, { active: false });
      }
    }
    // 선택 공지 active = true
    await updateAnnouncement(targetId, { active: true });
    loadAnnouncements();
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4 text-center">📢 공지사항 관리</h2>

      <div className="mb-4">
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>제목</Form.Label>
            <Form.Control
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>내용</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="공지 내용을 입력하세요"
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="이 공지를 활성화"
            checked={active}
            onChange={() => setActive(!active)}
            className="mb-3"
          />

          <Button variant="primary" onClick={handleSave}>
            {editId ? "공지 수정" : "공지 추가"}
          </Button>{" "}
          {editId && (
            <Button variant="secondary" onClick={resetForm}>
              취소
            </Button>
          )}
        </Form>
      </div>

      <h4 className="fw-semibold">📋 등록된 공지 목록</h4>
      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>제목</th>
            <th>내용</th>
            <th>활성화</th>
            <th>작성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td style={{ whiteSpace: "pre-line" }}>{a.content}</td>
              <td>
                {a.active ? (
                  <span className="text-success fw-bold">ON</span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleSetActive(a.id)}
                  >
                    활성화
                  </Button>
                )}
              </td>
              <td>{a.createdAt?.toDate?.().toLocaleString?.() || "N/A"}</td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => handleEdit(a)}
                  className="me-2"
                >
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => {
                    setShowConfirm(true);
                    setDeleteTargetId(a.id);
                  }}
                >
                  삭제
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 삭제 확인 모달 */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>❗삭제 확인</Modal.Title>
        </Modal.Header>
        <Modal.Body>정말로 이 공지를 삭제하시겠습니까?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            취소
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

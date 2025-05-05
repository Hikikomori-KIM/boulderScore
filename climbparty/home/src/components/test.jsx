import { useState } from "react";

export default function ProductsDetail() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [topNote, setTopNote] = useState("");
  const [middleNote, setMiddleNote] = useState("");
  const [baseNote, setBaseNote] = useState("");
  const [intensity, setIntensity] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [volumes, setVolumes] = useState([{ size: "", stock: "" }]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleVolumeChange = (index, field, value) => {
    const updated = [...volumes];
    updated[index][field] = value;
    setVolumes(updated);
  };

  const addVolume = () => {
    setVolumes([...volumes, { size: "", stock: "" }]);
  };

  const removeVolume = (index) => {
    setVolumes(volumes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("상품이 등록되었습니다 (임시 처리)");
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* 좌측 이미지 업로드 및 미리보기 */}
        <div className="col-6 d-flex align-items-center justify-content-center bg-secondary">
          {preview ? (
            <img
              src={preview}
              alt="미리보기"
              className="img-thumbnail"
              style={{ width: "250px", height: "250px", objectFit: "cover" }}
            />
          ) : (
            <span className="text-white">이미지를 업로드하면 미리보기가 여기에 표시됩니다</span>
          )}
        </div>

        {/* 우측 입력 폼 */}
        <div className="col-6 bg-light d-flex align-items-center justify-content-center">
          <form onSubmit={handleSubmit} className="col-8 px-4">
            <h2 className="fw-bold mb-4">상품 정보 입력</h2>

            <input
              type="text"
              className="form-control mb-3"
              placeholder="상품명"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              className="form-control mb-3"
              placeholder="가격"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <textarea
              className="form-control mb-3"
              placeholder="상품 설명"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input type="file" className="form-control mb-3" onChange={handleImageUpload} />

            <h5 className="fw-bold mt-4 mb-3">용량 및 재고</h5>
            {volumes.map((v, i) => (
              <div key={i} className="d-flex gap-2 mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="용량"
                  value={v.size}
                  onChange={(e) => handleVolumeChange(i, "size", e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="재고"
                  value={v.stock}
                  onChange={(e) => handleVolumeChange(i, "stock", e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => removeVolume(i)}
                >
                  삭제
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-outline-dark w-100 mb-4" onClick={addVolume}>
              + 용량 추가
            </button>

            <h5 className="fw-bold mt-4 mb-3">향수 정보</h5>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="탑 노트"
              value={topNote}
              onChange={(e) => setTopNote(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="미들 노트"
              value={middleNote}
              onChange={(e) => setMiddleNote(e.target.value)}
            />
            <input
              type="text"
              className="form-control mb-3"
              placeholder="베이스 노트"
              value={baseNote}
              onChange={(e) => setBaseNote(e.target.value)}
            />

            <select
              className="form-select mb-4"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
            >
              <option value="">향수 강도 선택</option>
              <option value="EDT">오 드 뚜왈렛 (EDT)</option>
              <option value="EDP">오 드 퍼퓸 (EDP)</option>
              <option value="PERFUME">퍼퓸</option>
            </select>

            <button className="btn btn-dark w-100 py-2 rounded-pill fw-semibold">상품 등록</button>
          </form>
        </div>
      </div>
    </div>
  );
}

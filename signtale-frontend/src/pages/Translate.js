import { useState } from "react";
import SkeletonViewer from "../components/SkeletonViewer";
import { translateText } from "../services/api";
import "./Translate.css";

export default function Translate() {
  const [text, setText]         = useState("");
  const [keypoints, setKeypoints] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setKeypoints(null);
    try {
      const data = await translateText(text);
      setKeypoints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="translate-page">
      <span className="section-tag">✏️ Translate</span>
      <h2 className="section-title">Text → ASL Animation</h2>
      <p className="section-sub">
        Enter any sentence and let Signtale animate it in American Sign Language.
      </p>

      <div className="translate-grid">
        {/* Input panel */}
        <div className="translate-left">
          <div className="translate-box">
            <label className="translate-label">Your text</label>
            <textarea
              className="translate-textarea"
              placeholder="e.g. I am happy to meet you"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleTranslate()}
            />
            <div className="translate-actions">
              <span className="char-count">{text.length} chars</span>
              <button
                className="btn-translate"
                onClick={handleTranslate}
                disabled={!text.trim() || loading}
              >
                {loading ? "Translating…" : "✨ Translate to ASL"}
              </button>
            </div>
          </div>

          <div className="translate-tip">
            💡 Tip: Keep sentences short for best results. The model works best with simple, clear phrases.
          </div>
        </div>

        {/* Output panel */}
        <div className="translate-output">
          {loading && (
            <div className="translate-state">
              <div className="spinner" />
              <p>Generating animation…</p>
            </div>
          )}
          {error && (
            <div className="translate-state">
              <p className="translate-error">⚠️ {error}</p>
            </div>
          )}
          {!loading && !error && keypoints && (
            <div style={{ textAlign: "center" }}>
              <SkeletonViewer keypoints={keypoints} />
              <p className="translate-animating">Animating: "{text}"</p>
            </div>
          )}
          {!loading && !error && !keypoints && (
            <div className="translate-placeholder">
              <span className="placeholder-icon">🤲</span>
              <p>Your animation will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
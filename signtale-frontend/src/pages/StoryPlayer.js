import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SkeletonViewer from "../components/SkeletonViewer";
import { getStoryKeypoints } from "../services/api";
import "./StoryPlayer.css";

export default function StoryPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Story metadata + animation frames all come from the backend now —
  // no dependency on the local stories.js mock.
  const [story, setStory] = useState(null);
  const [frames, setFrames] = useState([]);
  const [fps, setFps] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordSegments, setWordSegments] = useState([]);


  useEffect(() => {
    setLoading(true);
    setFrames([]);
    setStory(null);
    setWordSegments([]);
    setError(null);

    getStoryKeypoints(id)
      .then((data) => {
        // data shape (from backend StoryDetail):
        // { id, emoji, bg, tag, tag_bg, title, desc, duration, level,
        //   text, glosses, gloss_ids, frames, frame_count, fps }
        setStory(data);
        setFrames(data.frames);
        setFps(data.fps ?? 25);
        setWordSegments(data.word_segments ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="player-page">
        <button className="player-back" onClick={() => navigate("/stories")}>← Back</button>
        <div className="player-state">
          <div className="spinner" />
          <p>Generating animation…</p>
          <p className="player-state-sub">
            The model is signing the story. This takes a few seconds.
          </p>
        </div>
      </main>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !story) {
    return (
      <main className="player-page">
        <button className="player-back" onClick={() => navigate("/stories")}>← Back</button>
        <div className="player-state">
          <p className="player-error-msg">
            ⚠️ {error ?? "Story not found."}
          </p>
          <button className="btn-primary" onClick={() => navigate("/stories")}>
            ← Back to stories
          </button>
        </div>
      </main>
    );
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  return (
    <main className="player-page">
      <button className="player-back" onClick={() => navigate("/stories")}>← Back</button>

      <div className="player-header">
        <div className="player-thumb" style={{ background: story.bg }}>
          {story.emoji}
        </div>
        <div>
          <span className="card-tag" style={{ background: story.tag_bg }}>
            {story.tag}
          </span>
          <h1 className="player-title">{story.title}</h1>
          <p className="player-desc">{story.desc}</p>
          <span className="player-duration">⏱ {story.duration}</span>
        </div>
      </div>

      {/* Story text so the reader can follow along */}
      <div className="player-text-wrap">
        <p className="player-story-text">{story.text}</p>
      </div>

      {/* Gloss sequence — useful for understanding what the model signed */}
      {story.glosses?.length > 0 && (
        <div className="player-glosses" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {story.glosses.map((g, i) => (
            <span key={i} className="player-gloss-chip" style={{ padding: '4px 8px', backgroundColor: '#eee', borderRadius: '4px' }}>
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Skeleton animation */}
      <div className="player-viewer-wrap">
        <SkeletonViewer frames={frames} fps={fps} autoPlay={true} wordSegments={wordSegments} />
      </div>
    </main>
  );
}
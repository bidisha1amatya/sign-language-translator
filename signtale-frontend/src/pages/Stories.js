import { useEffect, useState } from "react";
import StoryCard from "../components/StoryCard";
import { getStories } from "../services/api";
import "./Stories.css";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getStories()
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="stories-page">
      <span className="section-tag">📚 All Stories</span>
      <h2 className="section-title">Browse the library</h2>
      <p className="section-sub">
        Every story has been carefully crafted for ASL animation. Pick one and dive in.
      </p>

      {loading && (
        <div className="stories-state">
          <div className="spinner" />
          <p>Loading stories…</p>
        </div>
      )}

      {error && (
        <div className="stories-state">
          <p className="stories-error">⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="stories-full-grid">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      )}
    </main>
  );
}
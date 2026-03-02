import StoryCard from "../components/StoryCard";
import stories from "../data/stories";
import "./Stories.css";

export default function Stories() {
  return (
    <main className="stories-page">
      <span className="section-tag">📚 All Stories</span>
      <h2 className="section-title">Browse the library</h2>
      <p className="section-sub">
        Every story has been carefully crafted for ASL animation. Pick one and dive in.
      </p>

      <div className="stories-full-grid">
        {stories.map((s) => (
          <StoryCard key={s.id} story={s} />
        ))}
      </div>
    </main>
  );
}
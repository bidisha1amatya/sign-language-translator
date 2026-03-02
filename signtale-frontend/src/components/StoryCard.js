import { useNavigate } from "react-router-dom";
import "./StoryCard.css";

export default function StoryCard({ story }) {
  const navigate = useNavigate();

  return (
    <div className="story-card" onClick={() => navigate(`/story/${story.id}`)}>
      <div className="card-thumb" style={{ background: story.bg }}>
        <span className="card-thumb-emoji">{story.emoji}</span>
      </div>
      <div className="card-body">
        <span className="card-tag" style={{ background: story.tagBg }}>
          {story.tag}
        </span>
        <div className="card-title">{story.title}</div>
        <div className="card-desc">{story.desc}</div>
        <div className="card-footer">
          <span className="card-duration">⏱ {story.duration}</span>
          <button className="card-play" onClick={(e) => { e.stopPropagation(); navigate(`/story/${story.id}`); }}>
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
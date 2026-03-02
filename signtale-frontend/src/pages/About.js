import "./About.css";

const cards = [
  {
    title: "Our Mission",
    body:  "We believe every person deserves access to stories. Signtale uses AI to make literature and communication available to the deaf and hard-of-hearing community in a beautiful, visual way.",
    gradient: "linear-gradient(135deg, var(--pink), var(--peach))",
  },
  {
    title: "The Technology",
    body:  "Built on FastAPI, Three.js, and a custom ML pipeline, Signtale converts natural language into 3D skeleton animations — frame by frame, sign by sign.",
    gradient: "linear-gradient(135deg, var(--mint), var(--sky))",
  },
  {
    title: "Academic Context",
    body:  "This project is part of ongoing research in accessibility tech and human-computer interaction. It aims to demonstrate how AI can serve social good.",
    gradient: "linear-gradient(135deg, var(--yellow), var(--peach))",
  },
  {
    title: "Accessibility First",
    body:  "Every design and technical decision is made with accessibility in mind. From color contrast to animation speed, Signtale is built to be clear, calm, and inclusive.",
    gradient: "linear-gradient(135deg, var(--lavender), var(--pink))",
  },
];

export default function About() {
  return (
    <main>
      <div className="about-hero">
        <span className="section-tag">ℹ️ About</span>
        <h2 className="section-title">Making stories accessible for everyone</h2>
        <p className="about-intro">
          Signtale is a research-driven project combining NLP, ML, and 3D animation to bridge
          the gap between written language and ASL.
        </p>
      </div>

      <div className="about-grid">
        {cards.map((card) => (
          <div key={card.title} className="about-card" style={{ background: card.gradient }}>
            <h3 className="about-card-title">{card.title}</h3>
            <p className="about-card-body">{card.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
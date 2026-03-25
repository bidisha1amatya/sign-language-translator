"""
/api/stories  — story keypoint data (for StoryPlayer.jsx)

GET  /api/stories          → list of stories
GET  /api/stories/{id}     → full story with keypoint frames
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.preprocessor import text_to_gloss
from services.vocab        import glosses_to_word_id_pairs         
from services.inference    import run_inference_per_word, model_is_loaded 


logger = logging.getLogger(__name__)
router = APIRouter(tags=["stories"])

# ---------------------------------------------------------------------------
# Story data — single source of truth for both listing and player
# ---------------------------------------------------------------------------
MOCK_STORIES = [
    {
        "id": "1",
        "emoji": "👑",
        "bg": "#FFE4A0",
        "tag": "Story",
        "tag_bg": "#FFE4A0",
        "title": "The Golden Touch",
        "desc": "A king learns that greed comes with a price.",
        "duration": "1 min",
        "level": "intermediate",
        "text": (
            "King received a wish and he wished that everything he touched would turn gold. "
            "First he was happy but when he by mistake turned his food and even his daughter "
            "into gold he realized that his intense greed made him suffer."
        ),
    },
]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class StorySummary(BaseModel):
    id: str
    emoji: str
    bg: str
    tag: str
    tag_bg: str
    title: str
    desc: str
    duration: str
    level: str

class WordSegment(BaseModel):
    word:        str
    start_frame: int
    end_frame:   int

class StoryDetail(StorySummary):
    text:          str
    glosses:       list[str]
    gloss_ids:     list[int]
    word_segments: list[WordSegment]   # ← new
    frames:        list[dict]
    frame_count:   int
    fps:           int
    model_loaded:  bool     


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/stories", response_model=list[StorySummary])
async def list_stories():
    """Return all story summaries for the Stories listing page."""
    return [
        StorySummary(**{k: s[k] for k in StorySummary.model_fields})
        for s in MOCK_STORIES
    ]


@router.get("/stories/{story_id}", response_model=StoryDetail)
async def get_story(story_id: str):
    """
    Return a single story with fully generated keypoint frames.
    The text is run through the full pipeline:
      text → glosses → gloss IDs → model inference → frames
    """
    story = next((s for s in MOCK_STORIES if s["id"] == story_id), None)
    if not story:
        raise HTTPException(
            status_code=404,
            detail=f"Story '{story_id}' not found."
        )

   
    try:
        # ── Step 1: Text → Gloss sequences (one list per clause/sentence) ────────
        gloss_sequences = text_to_gloss(story["text"])          # list[list[str]]

        # ── Step 2: Flatten for vocab lookup & display ───────────────────────────
        glosses = [token for seq in gloss_sequences for token in seq]  # flat list[str]

        pairs, oov    = glosses_to_word_id_pairs(glosses)
        gloss_ids     = [gid for _, gid in pairs]

        if oov:
            logger.warning(f"Story {story_id} — OOV glosses skipped: {oov}")

        frames, word_segments = run_inference_per_word(pairs)  # ← changed

    except Exception as e:
        logger.error(f"Inference failed for story {story_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Animation generation failed: {str(e)}"
        )

    logger.info(
        f"Story {story_id} ({story['title']}) — "
        f"{len(pairs)} words → {len(frames)} frames"
    )

    return StoryDetail(
        **{k: story[k] for k in StorySummary.model_fields},
        text=story["text"],
        glosses=glosses,
        gloss_ids=gloss_ids,
        word_segments=word_segments,       # ← new
        frames=frames,
        frame_count=len(frames),
        fps=25,
        model_loaded=model_is_loaded(),    # ← new
    )
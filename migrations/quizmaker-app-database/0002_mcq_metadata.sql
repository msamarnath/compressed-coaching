-- Phase 2 schema enhancements: MCQ metadata (marks, difficulty, tags)

ALTER TABLE mcq_questions ADD COLUMN marks INTEGER NOT NULL DEFAULT 1;
ALTER TABLE mcq_questions ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'Medium';

-- Tags are user-owned and reusable across questions.
CREATE TABLE IF NOT EXISTS mcq_tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mcq_tags_user_name_unique ON mcq_tags (user_id, name);
CREATE INDEX IF NOT EXISTS idx_mcq_tags_user_id ON mcq_tags (user_id);

-- Join table between questions and tags.
CREATE TABLE IF NOT EXISTS mcq_question_tags (
  question_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id, tag_id),
  FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES mcq_tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_mcq_question_tags_question_id ON mcq_question_tags (question_id);
CREATE INDEX IF NOT EXISTS idx_mcq_question_tags_tag_id ON mcq_question_tags (tag_id);


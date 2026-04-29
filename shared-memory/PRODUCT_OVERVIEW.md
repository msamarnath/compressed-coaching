# QuizMaker - Product Overview

## What is QuizMaker?

QuizMaker is a web-based application that enables K-12 teachers to create, manage, and share multiple choice questions (MCQs) for classroom assessments. Teachers can build questions manually or leverage AI to generate standards-aligned questions based on Texas Essential Knowledge and Skills (TEKS) standards.

## Who is it for?

QuizMaker is designed for K-12 educators who need to create formative and summative assessments quickly and with confidence that their questions align to state curriculum standards. The primary users are classroom teachers, instructional coaches, and curriculum specialists.

## Core Capabilities

### 1. Secure Teacher Accounts

Teachers create personal accounts to access QuizMaker. Each teacher's work is private and tied to their account. The system provides:

- Email and password registration
- Secure login with session persistence
- Automatic protection of all content behind authentication
- Simple logout

### 2. Multiple Choice Question Management

Teachers can build and organize a personal library of multiple choice questions. The question management system supports:

- **Create questions** with a title, description, question stem, and 2 to 6 answer choices with exactly one correct answer
- **Edit questions** to refine wording, adjust choices, or change the correct answer
- **Delete questions** that are no longer needed
- **Search and browse** the question library with keyword search and pagination
- **Preview and attempt** questions in a quiz-taking view to verify they work as intended before use in the classroom

### 3. AI-Powered TEKS-Aligned Question Generation

Teachers can generate high-quality, standards-aligned questions using AI. The generation workflow guides teachers through selecting the exact standard they want to assess:

- **Select a subject** (Mathematics or Science)
- **Select a grade level** (Grades 3-6)
- **Select a strand** (e.g., Number and Operations, Algebraic Reasoning)
- **Select a specific standard** with its TEKS code and description
- **Optionally provide topic specifics** to narrow the question focus

The AI generates a complete question with title, description, question stem, four answer choices, and the correct answer clearly marked. The teacher reviews the generated question and can edit it before saving, ensuring the teacher always has final control over content quality.

## User Experience

### First-Time User Flow

1. Teacher visits QuizMaker and creates an account with name, email, and password
2. After signup, the teacher lands on the MCQ management dashboard
3. The dashboard shows an empty state with a prompt to create their first question
4. Teacher clicks "Create MCQ" to start building a question

### Ongoing Usage

1. Teacher logs in and sees their question library with search and pagination
2. Teacher creates questions manually or uses "Generate with TEKS" for AI-assisted creation
3. Teacher previews questions to verify correctness before classroom use
4. Teacher edits or deletes questions as curriculum needs evolve

### Question Creation Options

**Manual creation**: Teacher fills out the question form directly -- enters a title, description, the question, and adds answer choices. The form validates that at least 2 choices exist and exactly one is marked correct.

**AI-assisted creation**: Teacher clicks "Generate with TEKS", selects the standard from cascading dropdowns, and optionally adds topic specifics. The AI generates a complete question that populates the form. The teacher reviews, edits if needed, and saves.

## Key Product Principles

- **Teacher control**: AI assists but the teacher always has final say on content
- **Simplicity**: Minimal steps to create, find, and manage questions
- **Standards alignment**: TEKS integration ensures curriculum relevance
- **Privacy**: Each teacher's content is private to their account
- **Quality**: Preview mode lets teachers verify questions before classroom use

## Current Scope

### Included

- Teacher registration and authentication
- Full MCQ CRUD (create, read, update, delete)
- Search and pagination for question library
- Question preview with attempt tracking
- AI question generation aligned to TEKS (Math and Science, Grades 3-6)

### Future Considerations

- Password reset and email verification
- Sharing questions between teachers
- Organizing questions into quizzes and assessments
- Student-facing quiz delivery
- Analytics and reporting on student performance
- Additional subjects and grade levels for TEKS alignment
- Export to common assessment formats (QTI, PDF)

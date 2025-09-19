from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple-choice"
    TRUE_FALSE = "true-false"
    FILL_BLANK = "fill-blank"
    SHORT_ANSWER = "short-answer"

class Subject(str, Enum):
    SCIENCE = "science"
    MATHS = "maths"
    ENGLISH = "english"
    ODISSI = "odissi"
    TECHNOLOGY = "technology"
    ENGINEERING = "engineering"

class MultilingualText(BaseModel):
    en: str
    od: str
    hi: str

class QuestionOptions(BaseModel):
    en: List[str]
    od: List[str]
    hi: List[str]

class GeneratedQuestion(BaseModel):
    id: str
    type: QuestionType
    question: MultilingualText
    options: Optional[QuestionOptions] = None
    correctAnswer: Union[int, str]
    explanation: MultilingualText
    hint: Optional[MultilingualText] = None
    culturalContext: Optional[MultilingualText] = None
    difficulty: DifficultyLevel
    topic: str
    grade: int
    subject: Subject

class QuestionGenerationRequest(BaseModel):
    subject: Subject
    grade: int
    topic: str
    count: int = 5
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM

class LessonContent(BaseModel):
    title: MultilingualText
    introduction: MultilingualText
    objectives: Dict[str, List[str]]  # {"en": [...], "od": [...], "hi": [...]}
    content: MultilingualText
    activities: Dict[str, List[str]]
    culturalRelevance: MultilingualText
    realWorldApplications: Dict[str, List[str]]

class LessonGenerationRequest(BaseModel):
    subject: Subject
    grade: int
    topic: str

class StudentPerformance(BaseModel):
    averageScore: float
    weakTopics: List[str]
    strongTopics: List[str]

class AdaptiveQuestionRequest(BaseModel):
    subject: Subject
    grade: int
    studentPerformance: StudentPerformance

class QuestionResponse(BaseModel):
    success: bool
    questions: List[GeneratedQuestion]
    message: Optional[str] = None

class LessonResponse(BaseModel):
    success: bool
    lesson: Optional[LessonContent] = None
    message: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str

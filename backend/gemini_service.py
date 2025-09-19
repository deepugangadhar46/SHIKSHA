import google.generativeai as genai
import json
import re
from typing import List, Dict, Any
from models import (
    GeneratedQuestion, LessonContent, QuestionGenerationRequest,
    LessonGenerationRequest, AdaptiveQuestionRequest, MultilingualText,
    QuestionOptions, DifficultyLevel, QuestionType, Subject
)
from curriculum import get_curriculum_topics, get_cultural_contexts
from config import GEMINI_API_KEY

class GeminiContentService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def _clean_json_response(self, text: str) -> str:
        """Clean and extract JSON from Gemini response"""
        # Remove markdown code blocks
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        
        # Find JSON object
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json_match.group(0)
        
        raise ValueError("No valid JSON found in response")
    
    async def generate_questions(self, request: QuestionGenerationRequest) -> List[GeneratedQuestion]:
        """Generate questions based on Odisha curriculum"""
        
        curriculum_topics = get_curriculum_topics(request.grade, request.subject.value)
        cultural_contexts = get_cultural_contexts(request.subject.value)
        
        # Find relevant curriculum topic
        relevant_topic = request.topic
        for topic in curriculum_topics:
            if request.topic.lower() in topic.lower() or topic.lower() in request.topic.lower():
                relevant_topic = topic
                break
        
        prompt = f"""
Generate {request.count} educational questions for Odisha Government State Board curriculum.

CURRICULUM DETAILS:
- Subject: {request.subject.value.title()}
- Grade: {request.grade}
- Topic: {relevant_topic}
- Difficulty: {request.difficulty.value}
- Available curriculum topics for this grade: {', '.join(curriculum_topics[:10])}

REQUIREMENTS:
1. Questions MUST align with Odisha State Board curriculum for Class {request.grade}
2. Include cultural context relevant to Odisha (temples, festivals, local examples)
3. Provide questions in English, Odia (ଓଡ଼ିଆ), and Hindi (हिंदी)
4. Include explanations that connect to local Odisha examples
5. Make questions engaging for rural students
6. Use practical examples from Odisha like:
   - Konark Sun Temple for science/engineering/maths
   - Jagannath Temple for cultural/religious contexts
   - Chilika Lake for environmental science
   - Traditional Odia crafts for technology
   - Local festivals and traditions
   - Agricultural practices in Odisha

CULTURAL CONTEXTS TO USE:
{', '.join(cultural_contexts[:5])}

FORMAT: Return ONLY valid JSON with this exact structure:
{{
  "questions": [
    {{
      "id": "q_{request.subject.value}_{request.grade}_1",
      "type": "multiple-choice",
      "question": {{
        "en": "English question text",
        "od": "ଓଡ଼ିଆ ପ୍ରଶ୍ନ ପାଠ୍ୟ",
        "hi": "हिंदी प्रश्न पाठ"
      }},
      "options": {{
        "en": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "od": ["ବିକଳ୍ପ ୧", "ବିକଳ୍ପ ୨", "ବିକଳ୍ପ ୩", "ବିକଳ୍ପ ୪"],
        "hi": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"]
      }},
      "correctAnswer": 0,
      "explanation": {{
        "en": "Detailed English explanation with Odisha examples",
        "od": "ଓଡ଼ିଶା ଉଦାହରଣ ସହିତ ବିସ୍ତୃତ ଓଡ଼ିଆ ବ୍ୟାଖ୍ୟା",
        "hi": "ओडिशा के उदाहरणों के साथ विस्तृत हिंदी व्याख्या"
      }},
      "hint": {{
        "en": "Helpful English hint",
        "od": "ସହାୟକ ଓଡ଼ିଆ ସୂଚନା",
        "hi": "सहायक हिंदी संकेत"
      }},
      "culturalContext": {{
        "en": "How this relates to Odisha culture/traditions",
        "od": "ଏହା କିପରି ଓଡ଼ିଶା ସଂସ୍କୃତି/ପରମ୍ପରା ସହିତ ସମ୍ପର୍କିତ",
        "hi": "यह ओडिशा संस्कृति/परंपराओं से कैसे संबंधित है"
      }},
      "difficulty": "{request.difficulty.value}",
      "topic": "{relevant_topic}",
      "grade": {request.grade},
      "subject": "{request.subject.value}"
    }}
  ]
}}

IMPORTANT: 
- Ensure all Odia text uses proper Unicode characters
- Make questions practical and relatable to rural Odisha students
- Include specific Odisha landmarks, festivals, or traditions in examples
- Difficulty should match the requested level: {request.difficulty.value}
"""

        try:
            response = self.model.generate_content(prompt)
            cleaned_json = self._clean_json_response(response.text)
            
            data = json.loads(cleaned_json)
            questions = []
            
            for i, q_data in enumerate(data.get("questions", [])):
                question = GeneratedQuestion(
                    id=f"{request.subject.value}_{request.grade}_{i+1}_{hash(str(q_data)) % 10000}",
                    type=QuestionType(q_data.get("type", "multiple-choice")),
                    question=MultilingualText(**q_data["question"]),
                    options=QuestionOptions(**q_data["options"]) if q_data.get("options") else None,
                    correctAnswer=q_data["correctAnswer"],
                    explanation=MultilingualText(**q_data["explanation"]),
                    hint=MultilingualText(**q_data["hint"]) if q_data.get("hint") else None,
                    culturalContext=MultilingualText(**q_data["culturalContext"]) if q_data.get("culturalContext") else None,
                    difficulty=DifficultyLevel(q_data.get("difficulty", request.difficulty.value)),
                    topic=q_data.get("topic", relevant_topic),
                    grade=q_data.get("grade", request.grade),
                    subject=Subject(q_data.get("subject", request.subject.value))
                )
                questions.append(question)
            
            return questions
            
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            raise Exception(f"Failed to generate questions: {str(e)}")
    
    async def generate_lesson_content(self, request: LessonGenerationRequest) -> LessonContent:
        """Generate comprehensive lesson content based on Odisha curriculum"""
        
        curriculum_topics = get_curriculum_topics(request.grade, request.subject.value)
        cultural_contexts = get_cultural_contexts(request.subject.value)
        
        relevant_topic = request.topic
        for topic in curriculum_topics:
            if request.topic.lower() in topic.lower() or topic.lower() in request.topic.lower():
                relevant_topic = topic
                break
        
        prompt = f"""
Create comprehensive lesson content for Odisha Government State Board curriculum.

CURRICULUM DETAILS:
- Subject: {request.subject.value.title()}
- Grade: {request.grade}  
- Topic: {relevant_topic}
- Curriculum topics for this grade: {', '.join(curriculum_topics[:8])}

REQUIREMENTS:
1. Align with Odisha State Board curriculum standards for Class {request.grade}
2. Include cultural examples from Odisha (temples, festivals, local practices)
3. Provide content in English, Odia, and Hindi
4. Make it engaging for rural students
5. Include practical applications relevant to Odisha

CULTURAL CONTEXTS TO INCORPORATE:
{', '.join(cultural_contexts[:5])}

FORMAT: Return ONLY valid JSON:
{{
  "title": {{
    "en": "English lesson title",
    "od": "ଓଡ଼ିଆ ପାଠ ଶୀର୍ଷକ", 
    "hi": "हिंदी पाठ शीर्षक"
  }},
  "introduction": {{
    "en": "Engaging English introduction paragraph",
    "od": "ଆକର୍ଷଣୀୟ ଓଡ଼ିଆ ପରିଚୟ ଅନୁଚ୍ଛେଦ",
    "hi": "आकर्षक हिंदी परिचय पैराग्राफ"
  }},
  "objectives": {{
    "en": ["Learning objective 1", "Learning objective 2", "Learning objective 3"],
    "od": ["ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ୧", "ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ୨", "ଶିକ୍ଷଣ ଲକ୍ଷ୍ୟ ୩"],
    "hi": ["सीखने का उद्देश्य 1", "सीखने का उद्देश्य 2", "सीखने का उद्देश्य 3"]
  }},
  "content": {{
    "en": "Detailed English content explanation with examples",
    "od": "ଉଦାହରଣ ସହିତ ବିସ୍ତୃତ ଓଡ଼ିଆ ବିଷୟବସ୍ତୁ ବ୍ୟାଖ୍ୟା",
    "hi": "उदाहरणों के साथ विस्तृत हिंदी सामग्री व्याख्या"
  }},
  "activities": {{
    "en": ["Hands-on activity 1", "Group activity 2", "Individual task 3"],
    "od": ["ବ୍ୟବହାରିକ କାର୍ଯ୍ୟକଳାପ ୧", "ଗୋଷ୍ଠୀ କାର୍ଯ୍ୟକଳାପ ୨", "ବ୍ୟକ୍ତିଗତ କାର୍ଯ୍ୟ ୩"],
    "hi": ["व्यावहारिक गतिविधि 1", "समूह गतिविधि 2", "व्यक्तिगत कार्य 3"]
  }},
  "culturalRelevance": {{
    "en": "How this topic connects to Odisha culture and traditions",
    "od": "ଏହି ବିଷୟ କିପରି ଓଡ଼ିଶା ସଂସ୍କୃତି ଏବଂ ପରମ୍ପରା ସହିତ ଜଡ଼ିତ",
    "hi": "यह विषय ओडिशा संस्कृति और परंपराओं से कैसे जुड़ता है"
  }},
  "realWorldApplications": {{
    "en": ["Application in local industry", "Use in daily life", "Career opportunities"],
    "od": ["ସ୍ଥାନୀୟ ଶିଳ୍ପରେ ପ୍ରୟୋଗ", "ଦୈନନ୍ଦିନ ଜୀବନରେ ବ୍ୟବହାର", "କ୍ୟାରିୟର ସୁଯୋଗ"],
    "hi": ["स्थानीय उद्योग में अनुप्रयोग", "दैनिक जीवन में उपयोग", "करियर के अवसर"]
  }}
}}

Use specific Odisha examples like:
- Konark Temple's architectural principles for engineering/science
- Chilika Lake's ecosystem for environmental science  
- Traditional Odia crafts for technology/arts
- Local agricultural practices for practical applications
- Jagannath Temple's cultural significance
- Regional festivals and their scientific/mathematical aspects
"""

        try:
            response = self.model.generate_content(prompt)
            cleaned_json = self._clean_json_response(response.text)
            
            data = json.loads(cleaned_json)
            
            lesson = LessonContent(
                title=MultilingualText(**data["title"]),
                introduction=MultilingualText(**data["introduction"]),
                objectives=data["objectives"],
                content=MultilingualText(**data["content"]),
                activities=data["activities"],
                culturalRelevance=MultilingualText(**data["culturalRelevance"]),
                realWorldApplications=data["realWorldApplications"]
            )
            
            return lesson
            
        except Exception as e:
            print(f"Error generating lesson content: {str(e)}")
            raise Exception(f"Failed to generate lesson content: {str(e)}")
    
    async def generate_adaptive_questions(self, request: AdaptiveQuestionRequest) -> List[GeneratedQuestion]:
        """Generate adaptive questions based on student performance"""
        
        # Determine difficulty based on performance
        avg_score = request.studentPerformance.averageScore
        if avg_score >= 80:
            difficulty = DifficultyLevel.HARD
        elif avg_score >= 60:
            difficulty = DifficultyLevel.MEDIUM
        else:
            difficulty = DifficultyLevel.EASY
        
        # Focus on weak topics
        focus_topics = request.studentPerformance.weakTopics
        if not focus_topics:
            focus_topics = get_curriculum_topics(request.grade, request.subject.value)[:3]
        
        # Create question generation request for adaptive content
        question_request = QuestionGenerationRequest(
            subject=request.subject,
            grade=request.grade,
            topic=focus_topics[0] if focus_topics else "General",
            count=5,
            difficulty=difficulty
        )
        
        return await self.generate_questions(question_request)

# Initialize the service
gemini_service = GeminiContentService()

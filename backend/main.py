from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import List
import asyncio

from models import (
    QuestionGenerationRequest, LessonGenerationRequest, AdaptiveQuestionRequest,
    QuestionResponse, LessonResponse, ErrorResponse, GeneratedQuestion, LessonContent
)
from gemini_service import gemini_service
from curriculum import get_curriculum_topics, get_cultural_contexts, get_all_grades, get_all_subjects
from config import HOST, PORT, DEBUG, ALLOWED_ORIGINS

# Initialize FastAPI app
app = FastAPI(
    title="EduQuest Gemini API Service",
    description="AI-powered content generation for Odisha curriculum",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "EduQuest Gemini API Service is running",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Test Gemini service
        test_request = QuestionGenerationRequest(
            subject="science",
            grade=8,
            topic="Light",
            count=1,
            difficulty="easy"
        )
        await gemini_service.generate_questions(test_request)
        
        return {
            "status": "healthy",
            "gemini_api": "connected",
            "curriculum_data": "loaded"
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

@app.get("/curriculum/grades")
async def get_available_grades():
    """Get all available grades"""
    return {
        "grades": get_all_grades(),
        "message": "Available grades in Odisha curriculum"
    }

@app.get("/curriculum/subjects")
async def get_available_subjects():
    """Get all available subjects"""
    return {
        "subjects": get_all_subjects(),
        "message": "Available subjects in Odisha curriculum"
    }

@app.get("/curriculum/{grade}/{subject}/topics")
async def get_curriculum_topics_endpoint(grade: int, subject: str):
    """Get curriculum topics for a specific grade and subject"""
    topics = get_curriculum_topics(grade, subject)
    if not topics:
        raise HTTPException(
            status_code=404,
            detail=f"No topics found for grade {grade} and subject {subject}"
        )
    
    return {
        "grade": grade,
        "subject": subject,
        "topics": topics,
        "cultural_contexts": get_cultural_contexts(subject)
    }

@app.post("/generate/questions", response_model=QuestionResponse)
async def generate_questions_endpoint(request: QuestionGenerationRequest):
    """Generate questions based on Odisha curriculum"""
    try:
        questions = await gemini_service.generate_questions(request)
        
        return QuestionResponse(
            success=True,
            questions=questions,
            message=f"Generated {len(questions)} questions for {request.subject.value} grade {request.grade}"
        )
        
    except Exception as e:
        print(f"Error in generate_questions_endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {str(e)}"
        )

@app.post("/generate/lesson", response_model=LessonResponse)
async def generate_lesson_endpoint(request: LessonGenerationRequest):
    """Generate lesson content based on Odisha curriculum"""
    try:
        lesson = await gemini_service.generate_lesson_content(request)
        
        return LessonResponse(
            success=True,
            lesson=lesson,
            message=f"Generated lesson content for {request.subject.value} grade {request.grade}"
        )
        
    except Exception as e:
        print(f"Error in generate_lesson_endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate lesson content: {str(e)}"
        )

@app.post("/generate/adaptive-questions", response_model=QuestionResponse)
async def generate_adaptive_questions_endpoint(request: AdaptiveQuestionRequest):
    """Generate adaptive questions based on student performance"""
    try:
        questions = await gemini_service.generate_adaptive_questions(request)
        
        return QuestionResponse(
            success=True,
            questions=questions,
            message=f"Generated adaptive questions for {request.subject.value} grade {request.grade}"
        )
        
    except Exception as e:
        print(f"Error in generate_adaptive_questions_endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate adaptive questions: {str(e)}"
        )

@app.post("/generate/batch-questions")
async def generate_batch_questions(requests: List[QuestionGenerationRequest]):
    """Generate questions for multiple subjects/topics in batch"""
    results = []
    
    for request in requests:
        try:
            questions = await gemini_service.generate_questions(request)
            results.append({
                "subject": request.subject.value,
                "grade": request.grade,
                "topic": request.topic,
                "success": True,
                "questions": [q.dict() for q in questions],
                "count": len(questions)
            })
        except Exception as e:
            results.append({
                "subject": request.subject.value,
                "grade": request.grade,
                "topic": request.topic,
                "success": False,
                "error": str(e),
                "count": 0
            })
    
    return {
        "batch_results": results,
        "total_requests": len(requests),
        "successful": len([r for r in results if r["success"]]),
        "failed": len([r for r in results if not r["success"]])
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    print(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc) if DEBUG else "An error occurred while processing your request"
        }
    )

if __name__ == "__main__":
    print("Starting EduQuest Gemini API Service...")
    print(f"Server will run on http://{HOST}:{PORT}")
    print("Make sure to set your GEMINI_API_KEY in the .env file")
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        log_level="info"
    )

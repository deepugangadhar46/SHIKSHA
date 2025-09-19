// Frontend client for the Python Gemini backend

export interface BackendQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  question: {
    en: string;
    od: string;
    hi: string;
  };
  options?: {
    en: string[];
    od: string[];
    hi: string[];
  };
  correctAnswer: number | string;
  explanation: {
    en: string;
    od: string;
    hi: string;
  };
  hint?: {
    en: string;
    od: string;
    hi: string;
  };
  culturalContext?: {
    en: string;
    od: string;
    hi: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  grade: number;
  subject: string;
}

export interface BackendLessonContent {
  title: {
    en: string;
    od: string;
    hi: string;
  };
  introduction: {
    en: string;
    od: string;
    hi: string;
  };
  objectives: {
    en: string[];
    od: string[];
    hi: string[];
  };
  content: {
    en: string;
    od: string;
    hi: string;
  };
  activities: {
    en: string[];
    od: string[];
    hi: string[];
  };
  culturalRelevance: {
    en: string;
    od: string;
    hi: string;
  };
  realWorldApplications: {
    en: string[];
    od: string[];
    hi: string[];
  };
}

export interface QuestionGenerationRequest {
  subject: 'science' | 'maths' | 'english' | 'odissi' | 'technology' | 'engineering';
  grade: number;
  topic: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface LessonGenerationRequest {
  subject: 'science' | 'maths' | 'english' | 'odissi' | 'technology' | 'engineering';
  grade: number;
  topic: string;
}

export interface StudentPerformance {
  averageScore: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface AdaptiveQuestionRequest {
  subject: 'science' | 'maths' | 'english' | 'odissi' | 'technology' | 'engineering';
  grade: number;
  studentPerformance: StudentPerformance;
}

class BackendClient {
  private baseURL: string;
  private isAvailable: boolean = false;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    this.checkBackendAvailability();
  }

  private async checkBackendAvailability() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.status === 'healthy';
        console.log('Backend availability:', this.isAvailable ? '✅ Available' : '❌ Unavailable');
      }
    } catch (error) {
      console.log('Backend not available, using fallback content');
      this.isAvailable = false;
    }
  }

  public async isBackendAvailable(): Promise<boolean> {
    if (!this.isAvailable) {
      await this.checkBackendAvailability();
    }
    return this.isAvailable;
  }

  public async generateQuestions(request: QuestionGenerationRequest): Promise<BackendQuestion[]> {
    try {
      if (!await this.isBackendAvailable()) {
        throw new Error('Backend not available');
      }

      const response = await fetch(`${this.baseURL}/generate/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: request.subject,
          grade: request.grade,
          topic: request.topic,
          count: request.count || 5,
          difficulty: request.difficulty || 'medium'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  public async generateLessonContent(request: LessonGenerationRequest): Promise<BackendLessonContent> {
    try {
      if (!await this.isBackendAvailable()) {
        throw new Error('Backend not available');
      }

      const response = await fetch(`${this.baseURL}/generate/lesson`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate lesson content');
      }

      const data = await response.json();
      return data.lesson;
    } catch (error) {
      console.error('Error generating lesson content:', error);
      throw error;
    }
  }

  public async generateAdaptiveQuestions(request: AdaptiveQuestionRequest): Promise<BackendQuestion[]> {
    try {
      if (!await this.isBackendAvailable()) {
        throw new Error('Backend not available');
      }

      const response = await fetch(`${this.baseURL}/generate/adaptive-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate adaptive questions');
      }

      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      throw error;
    }
  }

  public async getCurriculumTopics(grade: number, subject: string): Promise<string[]> {
    try {
      if (!await this.isBackendAvailable()) {
        return this.getFallbackTopics(grade, subject);
      }

      const response = await fetch(`${this.baseURL}/curriculum/${grade}/${subject}/topics`);
      
      if (!response.ok) {
        return this.getFallbackTopics(grade, subject);
      }

      const data = await response.json();
      return data.topics;
    } catch (error) {
      console.error('Error fetching curriculum topics:', error);
      return this.getFallbackTopics(grade, subject);
    }
  }

  public async getAvailableGrades(): Promise<number[]> {
    try {
      if (!await this.isBackendAvailable()) {
        return [8, 9, 10, 11, 12];
      }

      const response = await fetch(`${this.baseURL}/curriculum/grades`);
      
      if (!response.ok) {
        return [8, 9, 10, 11, 12];
      }

      const data = await response.json();
      return data.grades;
    } catch (error) {
      console.error('Error fetching available grades:', error);
      return [8, 9, 10, 11, 12];
    }
  }

  public async getAvailableSubjects(): Promise<string[]> {
    try {
      if (!await this.isBackendAvailable()) {
        return ['science', 'maths', 'english', 'odissi', 'technology', 'engineering'];
      }

      const response = await fetch(`${this.baseURL}/curriculum/subjects`);
      
      if (!response.ok) {
        return ['science', 'maths', 'english', 'odissi', 'technology', 'engineering'];
      }

      const data = await response.json();
      return data.subjects;
    } catch (error) {
      console.error('Error fetching available subjects:', error);
      return ['science', 'maths', 'english', 'odissi', 'technology', 'engineering'];
    }
  }

  private getFallbackTopics(grade: number, subject: string): string[] {
    // Fallback topics when backend is not available
    const fallbackTopics: { [key: string]: { [key: number]: string[] } } = {
      science: {
        8: ['Light', 'Sound', 'Force and Pressure', 'Friction'],
        9: ['Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy'],
        10: ['Light Reflection', 'Electricity', 'Life Processes', 'Natural Resources']
      },
      maths: {
        8: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling'],
        9: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Triangles'],
        10: ['Real Numbers', 'Quadratic Equations', 'Trigonometry', 'Statistics']
      },
      english: {
        8: ['Grammar', 'Comprehension', 'Writing Skills', 'Literature'],
        9: ['Advanced Grammar', 'Literature Analysis', 'Essay Writing'],
        10: ['Critical Reading', 'Advanced Writing', 'Literature Criticism']
      },
      odissi: {
        8: ['Jagannath Culture', 'Konark Temple', 'Odia Literature', 'Traditional Arts'],
        9: ['Classical Poetry', 'Cultural Heritage', 'Folk Traditions', 'Dance Forms'],
        10: ['Modern Literature', 'Cultural Studies', 'Historical Perspectives']
      }
    };

    return fallbackTopics[subject]?.[grade] || ['General Topics'];
  }

  public async batchGenerateQuestions(requests: QuestionGenerationRequest[]): Promise<any> {
    try {
      if (!await this.isBackendAvailable()) {
        throw new Error('Backend not available for batch processing');
      }

      const response = await fetch(`${this.baseURL}/generate/batch-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requests),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate batch questions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in batch question generation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backendClient = new BackendClient();
export default backendClient;

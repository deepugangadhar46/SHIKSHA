// Odisha Government API Integration Service
// Fetches and caches curriculum content from government APIs
// Handles offline scenarios with cached content for rural connectivity

import { GameStorageService, CurriculumContent } from '../storage/indexed-db';

export interface OdishaCurriculumData {
  subject: string;
  classLevel: number;
  topic: string;
  content: {
    title: string;
    description: string;
    objectives: string[];
    concepts: ConceptData[];
    activities: ActivityData[];
    assessments: AssessmentData[];
    resources: ResourceData[];
  };
  language: 'en' | 'od' | 'hi';
  boardApproved: boolean;
  lastUpdated: string;
  version: string;
}

export interface ConceptData {
  id: string;
  name: string;
  description: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  prerequisites: string[];
  examples: string[];
  multimedia?: {
    images?: string[];
    videos?: string[];
    animations?: string[];
  };
}

export interface ActivityData {
  id: string;
  type: 'experiment' | 'problem_solving' | 'creative' | 'discussion';
  title: string;
  instructions: string[];
  materials: string[];
  duration: number; // in minutes
  groupSize: number;
  learningOutcomes: string[];
}

export interface AssessmentData {
  id: string;
  type: 'mcq' | 'short_answer' | 'long_answer' | 'practical';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomsLevel: string;
}

export interface ResourceData {
  id: string;
  type: 'pdf' | 'video' | 'audio' | 'interactive' | 'image';
  title: string;
  url: string;
  description: string;
  language: 'en' | 'od' | 'hi';
  size?: number;
  duration?: number;
}

// Mock Odisha Government API endpoints
const ODISHA_API_BASE = process.env.NEXT_PUBLIC_ODISHA_API_BASE || 'https://api.education.odisha.gov.in';
const API_ENDPOINTS = {
  curriculum: '/v1/curriculum',
  subjects: '/v1/subjects',
  classes: '/v1/classes',
  topics: '/v1/topics',
  resources: '/v1/resources',
  assessments: '/v1/assessments'
};

export class OdishaAPIService {
  private static apiKey = process.env.NEXT_PUBLIC_ODISHA_API_KEY || 'demo-key';
  private static retryAttempts = 3;
  private static retryDelay = 1000; // 1 second

  /**
   * Fetch curriculum data for specific subject and class
   */
  static async fetchCurriculumData(
    subject: string, 
    classLevel: number, 
    topic?: string,
    language: 'en' | 'od' | 'hi' = 'en'
  ): Promise<OdishaCurriculumData | null> {
    const cacheKey = `${subject}_${classLevel}_${topic || 'all'}_${language}`;
    
    try {
      // Try to get from cache first
      const cachedData = await this.getCachedCurriculum(cacheKey);
      if (cachedData && this.isCacheValid(cachedData)) {
        console.log('📚 Using cached curriculum data');
        return this.transformCachedData(cachedData);
      }

      // Fetch from API with retry logic
      const apiData = await this.fetchWithRetry(
        `${ODISHA_API_BASE}${API_ENDPOINTS.curriculum}`,
        {
          subject,
          class: classLevel,
          topic,
          language,
          format: 'detailed'
        }
      );

      if (apiData) {
        // Cache the data
        await this.cacheCurriculumData(cacheKey, apiData, language);
        console.log('🌐 Fetched fresh curriculum data from API');
        return apiData;
      }

      // Fallback to mock data if API fails
      console.log('🔄 Using fallback curriculum data');
      return this.getFallbackCurriculumData(subject, classLevel, topic, language);

    } catch (error) {
      console.error('❌ Error fetching curriculum data:', error);
      
      // Return cached data even if expired, or fallback data
      const cachedData = await this.getCachedCurriculum(cacheKey);
      if (cachedData) {
        return this.transformCachedData(cachedData);
      }
      
      return this.getFallbackCurriculumData(subject, classLevel, topic, language);
    }
  }

  /**
   * Transform curriculum content into game-friendly format
   */
  static transformToGameContent(curriculumData: OdishaCurriculumData, gameType: string): any {
    if (!curriculumData) return null;

    switch (gameType) {
      case 'drag-drop':
        return this.extractProblemsAndSolutions(curriculumData);
      case 'memory':
        return this.extractTermsAndDefinitions(curriculumData);
      case 'puzzle':
        return this.extractPuzzleElements(curriculumData);
      case 'simulation':
        return this.extractSimulationData(curriculumData);
      case 'strategy':
        return this.extractStrategyElements(curriculumData);
      default:
        return curriculumData.content;
    }
  }

  /**
   * Sync student progress with government tracking systems
   */
  static async syncProgressWithGovAPI(studentId: string, progressData: any): Promise<boolean> {
    try {
      // Anonymize data for privacy
      const anonymizedData = {
        studentHash: this.hashStudentId(studentId),
        subject: progressData.subject,
        classLevel: progressData.classLevel,
        gameType: progressData.gameType,
        score: progressData.score,
        timeSpent: progressData.timeSpent,
        completedAt: progressData.completedAt,
        region: 'Odisha',
        schoolType: 'rural' // This could be determined from student profile
      };

      const response = await this.fetchWithRetry(
        `${ODISHA_API_BASE}/v1/analytics/progress`,
        anonymizedData,
        'POST'
      );

      return response !== null;
    } catch (error) {
      console.error('❌ Failed to sync progress with government API:', error);
      return false;
    }
  }

  /**
   * Get available subjects for a class level
   */
  static async getAvailableSubjects(classLevel: number, language: 'en' | 'od' | 'hi' = 'en'): Promise<string[]> {
    try {
      const response = await this.fetchWithRetry(
        `${ODISHA_API_BASE}${API_ENDPOINTS.subjects}`,
        { class: classLevel, language }
      );

      return response?.subjects || this.getDefaultSubjects();
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      return this.getDefaultSubjects();
    }
  }

  /**
   * Get topics for a subject and class
   */
  static async getTopics(
    subject: string, 
    classLevel: number, 
    language: 'en' | 'od' | 'hi' = 'en'
  ): Promise<string[]> {
    try {
      const response = await this.fetchWithRetry(
        `${ODISHA_API_BASE}${API_ENDPOINTS.topics}`,
        { subject, class: classLevel, language }
      );

      return response?.topics || this.getDefaultTopics(subject, classLevel);
    } catch (error) {
      console.error('❌ Error fetching topics:', error);
      return this.getDefaultTopics(subject, classLevel);
    }
  }

  // Private helper methods

  private static async fetchWithRetry(
    url: string, 
    params: any, 
    method: 'GET' | 'POST' = 'GET'
  ): Promise<any> {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'X-API-Version': '1.0'
          }
        };

        if (method === 'GET') {
          const queryParams = new URLSearchParams(params).toString();
          url = `${url}?${queryParams}`;
        } else {
          options.body = JSON.stringify(params);
        }

        const response = await fetch(url, options);
        
        if (response.ok) {
          return await response.json();
        } else if (response.status === 429) {
          // Rate limited, wait longer
          await this.delay(this.retryDelay * attempt * 2);
          continue;
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (error) {
        console.warn(`API attempt ${attempt} failed:`, error);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        } else {
          throw error;
        }
      }
    }
    
    return null;
  }

  private static async getCachedCurriculum(key: string): Promise<CurriculumContent | undefined> {
    try {
      const cached = await GameStorageService.getCurriculumContent('', 0);
      return cached.find(c => c.id === key);
    } catch (error) {
      console.error('❌ Error getting cached curriculum:', error);
      return undefined;
    }
  }

  private static async cacheCurriculumData(
    key: string, 
    data: OdishaCurriculumData, 
    language: 'en' | 'od' | 'hi'
  ): Promise<void> {
    try {
      const curriculumContent: CurriculumContent = {
        id: key,
        subject: data.subject,
        classLevel: data.classLevel,
        topic: data.topic,
        content: data,
        language,
        lastUpdated: new Date(),
        version: data.version
      };

      await GameStorageService.saveCurriculumContent(curriculumContent);
    } catch (error) {
      console.error('❌ Error caching curriculum data:', error);
    }
  }

  private static isCacheValid(cached: CurriculumContent): boolean {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return cached.lastUpdated > oneWeekAgo;
  }

  private static transformCachedData(cached: CurriculumContent): OdishaCurriculumData {
    return cached.content as OdishaCurriculumData;
  }

  private static hashStudentId(studentId: string): string {
    // Simple hash for anonymization - in production, use proper crypto
    let hash = 0;
    for (let i = 0; i < studentId.length; i++) {
      const char = studentId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Fallback and default data methods

  private static getFallbackCurriculumData(
    subject: string, 
    classLevel: number, 
    topic?: string,
    language: 'en' | 'od' | 'hi' = 'en'
  ): OdishaCurriculumData {
    // Return mock curriculum data based on Odisha board syllabus
    return {
      subject,
      classLevel,
      topic: topic || 'General',
      content: {
        title: this.getSubjectTitle(subject, language),
        description: this.getSubjectDescription(subject, language),
        objectives: this.getSubjectObjectives(subject, classLevel, language),
        concepts: this.getSubjectConcepts(subject, classLevel),
        activities: this.getSubjectActivities(subject, classLevel),
        assessments: this.getSubjectAssessments(subject, classLevel),
        resources: this.getSubjectResources(subject, classLevel)
      },
      language,
      boardApproved: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  private static getDefaultSubjects(): string[] {
    return ['maths', 'science', 'technology', 'engineering', 'english', 'odissi'];
  }

  private static getDefaultTopics(subject: string, classLevel: number): string[] {
    const topicsBySubject: { [key: string]: { [key: number]: string[] } } = {
      maths: {
        6: ['Numbers', 'Basic Operations', 'Fractions', 'Decimals'],
        7: ['Integers', 'Fractions and Decimals', 'Simple Equations', 'Lines and Angles'],
        8: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling'],
        9: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Statistics'],
        10: ['Real Numbers', 'Polynomials', 'Triangles', 'Probability'],
        11: ['Sets', 'Relations and Functions', 'Trigonometry', 'Statistics'],
        12: ['Relations and Functions', 'Calculus', 'Vectors', 'Probability']
      },
      science: {
        6: ['Food', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials'],
        7: ['Nutrition in Plants', 'Heat', 'Acids and Bases', 'Weather and Climate'],
        8: ['Crop Production', 'Microorganisms', 'Force and Pressure', 'Light'],
        9: ['Matter in Our Surroundings', 'Tissues', 'Motion', 'Gravitation'],
        10: ['Chemical Reactions', 'Life Processes', 'Light', 'Electricity'],
        11: ['Physical World', 'Units and Measurements', 'Motion', 'Laws of Motion'],
        12: ['Electric Charges', 'Magnetism', 'Electromagnetic Induction', 'Optics']
      }
    };

    return topicsBySubject[subject]?.[classLevel] || ['General Topics'];
  }

  private static getSubjectTitle(subject: string, language: 'en' | 'od' | 'hi'): string {
    const titles = {
      maths: { en: 'Mathematics', od: 'ଗଣିତ', hi: 'गणित' },
      science: { en: 'Science', od: 'ବିଜ୍ଞାନ', hi: 'विज्ञान' },
      technology: { en: 'Technology', od: 'ପ୍ରଯୁକ୍ତିବିଦ୍ୟା', hi: 'प्रौद्योगिकी' },
      engineering: { en: 'Engineering', od: 'ଇଞ୍ଜିନିୟରିଂ', hi: 'इंजीनियरिंग' },
      english: { en: 'English', od: 'ଇଂରାଜୀ', hi: 'अंग्रेजी' },
      odissi: { en: 'Odia Culture', od: 'ଓଡ଼ିଶୀ ସଂସ୍କୃତି', hi: 'ओडिया संस्कृति' }
    };

    return titles[subject as keyof typeof titles]?.[language] || subject;
  }

  private static getSubjectDescription(subject: string, language: 'en' | 'od' | 'hi'): string {
    // Return appropriate description based on subject and language
    return `Comprehensive ${subject} curriculum for Odisha board students`;
  }

  private static getSubjectObjectives(subject: string, classLevel: number, language: 'en' | 'od' | 'hi'): string[] {
    // Return learning objectives based on subject and class level
    return [
      'Understand fundamental concepts',
      'Apply knowledge to solve problems',
      'Develop critical thinking skills',
      'Connect learning to real-world applications'
    ];
  }

  private static getSubjectConcepts(subject: string, classLevel: number): ConceptData[] {
    // Return concept data - this would be much more detailed in production
    return [
      {
        id: `${subject}_concept_1`,
        name: 'Basic Concept 1',
        description: 'Fundamental concept for this subject',
        difficulty: 'basic',
        prerequisites: [],
        examples: ['Example 1', 'Example 2']
      }
    ];
  }

  private static getSubjectActivities(subject: string, classLevel: number): ActivityData[] {
    return [
      {
        id: `${subject}_activity_1`,
        type: 'problem_solving',
        title: 'Interactive Problem Solving',
        instructions: ['Step 1', 'Step 2', 'Step 3'],
        materials: ['Basic materials'],
        duration: 30,
        groupSize: 1,
        learningOutcomes: ['Understanding of concepts']
      }
    ];
  }

  private static getSubjectAssessments(subject: string, classLevel: number): AssessmentData[] {
    return [
      {
        id: `${subject}_assessment_1`,
        type: 'mcq',
        question: 'Sample question for this subject',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: 'This is the correct answer because...',
        difficulty: 'medium',
        bloomsLevel: 'Understanding'
      }
    ];
  }

  private static getSubjectResources(subject: string, classLevel: number): ResourceData[] {
    return [
      {
        id: `${subject}_resource_1`,
        type: 'interactive',
        title: 'Interactive Learning Resource',
        url: '#',
        description: 'Interactive resource for learning',
        language: 'en'
      }
    ];
  }

  // Game content transformation methods

  private static extractProblemsAndSolutions(curriculumData: OdishaCurriculumData): any {
    return {
      problems: curriculumData.content.assessments.map(assessment => ({
        question: assessment.question,
        options: assessment.options,
        correctAnswer: assessment.correctAnswer,
        explanation: assessment.explanation
      })),
      concepts: curriculumData.content.concepts
    };
  }

  private static extractTermsAndDefinitions(curriculumData: OdishaCurriculumData): any {
    return {
      pairs: curriculumData.content.concepts.map(concept => ({
        term: concept.name,
        definition: concept.description,
        examples: concept.examples
      }))
    };
  }

  private static extractPuzzleElements(curriculumData: OdishaCurriculumData): any {
    return {
      elements: curriculumData.content.concepts,
      activities: curriculumData.content.activities.filter(a => a.type === 'problem_solving')
    };
  }

  private static extractSimulationData(curriculumData: OdishaCurriculumData): any {
    return {
      scenarios: curriculumData.content.activities.filter(a => a.type === 'experiment'),
      concepts: curriculumData.content.concepts,
      resources: curriculumData.content.resources
    };
  }

  private static extractStrategyElements(curriculumData: OdishaCurriculumData): any {
    return {
      challenges: curriculumData.content.assessments,
      strategies: curriculumData.content.activities,
      objectives: curriculumData.content.objectives
    };
  }
}

export default OdishaAPIService;

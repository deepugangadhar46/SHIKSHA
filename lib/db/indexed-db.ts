import Dexie, { Table } from 'dexie';

// Define interfaces for our data models
export interface UserData {
  id?: number;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  grade?: number;
  school?: string;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
    soundEnabled: boolean;
    reducedMotion: boolean;
  };
  culturalBackground?: {
    region: string;
    language: string;
    festivals: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgress {
  id?: number;
  userId: number;
  subject: string;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number; // in seconds
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameStats {
  id?: number;
  userId: number;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  achievements: string[];
  subjectProgress: {
    [key: string]: {
      level: number;
      xp: number;
      lessonsCompleted: number;
      averageScore: number;
    };
  };
  lastActiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentData {
  id?: number;
  subject: 'science' | 'technology' | 'engineering' | 'english' | 'maths' | 'odissi';
  topic: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'lesson' | 'quiz' | 'activity' | 'story';
  title: {
    en: string;
    od: string;
    hi: string;
  };
  content: {
    en: string;
    od: string;
    hi: string;
  };
  questions?: any[];
  culturalContext?: {
    en: string;
    od: string;
    hi: string;
  };
  mediaUrls?: string[];
  tags: string[];
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id?: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Create the database class
class ShikshaDB extends Dexie {
  users!: Table<UserData>;
  lessonProgress!: Table<LessonProgress>;
  gameStats!: Table<GameStats>;
  content!: Table<ContentData>;
  sessions!: Table<Session>;

  constructor() {
    super('ShikshaDB');
    
    // Define database schema
    this.version(1).stores({
      users: '++id, email, role, createdAt',
      lessonProgress: '++id, userId, subject, lessonId, [userId+lessonId]',
      gameStats: '++id, userId',
      content: '++id, subject, grade, type, createdAt',
      sessions: '++id, userId, token, expiresAt'
    });

    // Map tables to classes
    this.users = this.table('users');
    this.lessonProgress = this.table('lessonProgress');
    this.gameStats = this.table('gameStats');
    this.content = this.table('content');
    this.sessions = this.table('sessions');
  }
}

// Create database instance
export const db = new ShikshaDB();

// Authentication Service
export class AuthService {
  static async register(userData: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserData> {
    try {
      // Check if user already exists
      const existingUser = await db.users.where('email').equals(userData.email).first();
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser: UserData = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const userId = await db.users.add(newUser);
      
      // Initialize game stats for the user
      await db.gameStats.add({
        userId: userId as number,
        level: 1,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        achievements: [],
        subjectProgress: {
          science: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
          technology: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
          engineering: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
          english: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
          maths: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
          odissi: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 }
        },
        lastActiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { ...newUser, id: userId as number };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<{ user: UserData; token: string }> {
    try {
      // Ensure database is open
      if (!db.isOpen()) {
        await db.open();
      }

      const user = await db.users.where('email').equals(email).first();
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Simple password check (in production, use proper hashing)
      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Clean up old sessions for this user
      await db.sessions.where('userId').equals(user.id!).delete();

      // Create session token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      await db.sessions.add({
        userId: user.id!,
        token,
        expiresAt,
        createdAt: new Date()
      });

      // Update or create game stats
      const existingStats = await db.gameStats.where('userId').equals(user.id!).first();
      if (existingStats) {
        await db.gameStats.where('userId').equals(user.id!).modify({
          lastActiveDate: new Date()
        });
      } else {
        // Create initial game stats if they don't exist
        await db.gameStats.add({
          userId: user.id!,
          level: 1,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          badges: [],
          achievements: [],
          subjectProgress: {
            science: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
            technology: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
            engineering: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
            english: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
            maths: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 },
            odissi: { level: 1, xp: 0, lessonsCompleted: 0, averageScore: 0 }
          },
          lastActiveDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(token: string): Promise<void> {
    try {
      await db.sessions.where('token').equals(token).delete();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  static async validateSession(token: string): Promise<UserData | null> {
    try {
      const session = await db.sessions.where('token').equals(token).first();
      
      if (!session || session.expiresAt < new Date()) {
        if (session) {
          await db.sessions.delete(session.id!);
        }
        return null;
      }

      const user = await db.users.get(session.userId);
      return user || null;
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static async updateProfile(userId: number, updates: Partial<UserData>): Promise<UserData> {
    try {
      await db.users.update(userId, {
        ...updates,
        updatedAt: new Date()
      });

      const updatedUser = await db.users.get(userId);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  private static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

// Game Progress Service
export class GameProgressService {
  static async updateLessonProgress(
    userId: number,
    subject: string,
    lessonId: string,
    score: number,
    timeSpent: number
  ): Promise<void> {
    try {
      const existing = await db.lessonProgress
        .where(['userId', 'lessonId'])
        .equals([userId, lessonId])
        .first();

      if (existing) {
        await db.lessonProgress.update(existing.id!, {
          score: Math.max(existing.score, score),
          attempts: existing.attempts + 1,
          timeSpent: existing.timeSpent + timeSpent,
          completed: score >= 60,
          completedAt: score >= 60 ? new Date() : undefined,
          updatedAt: new Date()
        });
      } else {
        await db.lessonProgress.add({
          userId,
          subject,
          lessonId,
          completed: score >= 60,
          score,
          attempts: 1,
          timeSpent,
          completedAt: score >= 60 ? new Date() : undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Update game stats
      await this.updateGameStats(userId, subject, score);
    } catch (error) {
      console.error('Lesson progress update error:', error);
      throw error;
    }
  }

  static async updateGameStats(userId: number, subject: string, score: number): Promise<void> {
    try {
      const stats = await db.gameStats.where('userId').equals(userId).first();
      
      if (stats) {
        const xpGained = Math.round(score * 10);
        const currentSubjectProgress = stats.subjectProgress[subject] || {
          level: 1,
          xp: 0,
          lessonsCompleted: 0,
          averageScore: 0
        };

        // Update subject progress
        currentSubjectProgress.xp += xpGained;
        currentSubjectProgress.lessonsCompleted += 1;
        currentSubjectProgress.averageScore = 
          (currentSubjectProgress.averageScore * (currentSubjectProgress.lessonsCompleted - 1) + score) / 
          currentSubjectProgress.lessonsCompleted;

        // Level up logic
        const xpForNextLevel = currentSubjectProgress.level * 1000;
        if (currentSubjectProgress.xp >= xpForNextLevel) {
          currentSubjectProgress.level += 1;
          currentSubjectProgress.xp -= xpForNextLevel;
        }

        // Update streaks
        const lastActive = new Date(stats.lastActiveDate);
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStreak = stats.currentStreak;
        if (daysDiff === 0) {
          // Same day, streak continues
        } else if (daysDiff === 1) {
          // Next day, increment streak
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1;
        }

        // Add badges based on achievements
        const newBadges = [...stats.badges];
        if (score === 100 && !newBadges.includes('perfect_score')) {
          newBadges.push('perfect_score');
        }
        if (newStreak >= 7 && !newBadges.includes('week_streak')) {
          newBadges.push('week_streak');
        }
        if (currentSubjectProgress.level >= 5 && !newBadges.includes(`${subject}_expert`)) {
          newBadges.push(`${subject}_expert`);
        }

        await db.gameStats.update(stats.id!, {
          totalPoints: stats.totalPoints + xpGained,
          currentStreak: newStreak,
          longestStreak: Math.max(stats.longestStreak, newStreak),
          badges: newBadges,
          subjectProgress: {
            ...stats.subjectProgress,
            [subject]: currentSubjectProgress
          },
          lastActiveDate: new Date(),
          updatedAt: new Date()
        });

        // Calculate overall level
        const totalXP = Object.values(stats.subjectProgress).reduce((sum, prog: any) => sum + prog.xp, 0);
        const overallLevel = Math.floor(totalXP / 5000) + 1;
        
        await db.gameStats.update(stats.id!, {
          level: overallLevel
        });
      }
    } catch (error) {
      console.error('Game stats update error:', error);
      throw error;
    }
  }

  static async getUserStats(userId: number): Promise<GameStats | undefined> {
    try {
      return await db.gameStats.where('userId').equals(userId).first();
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  static async getUserProgress(userId: number, subject?: string): Promise<LessonProgress[]> {
    try {
      let query = db.lessonProgress.where('userId').equals(userId);
      
      if (subject) {
        return await query.and(item => item.subject === subject).toArray();
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }
}

// Content Management Service
export class ContentService {
  static async seedContent(): Promise<void> {
    try {
      const contentCount = await db.content.count();
      
      // Only seed if database is empty
      if (contentCount === 0) {
        const seedData: ContentData[] = [
          // Science Content
          {
            subject: 'science',
            topic: 'Solar System',
            grade: 6,
            difficulty: 'medium',
            type: 'lesson',
            title: {
              en: 'Exploring Our Solar System',
              od: 'ଆମ ସୌର ମଣ୍ଡଳ ଅନ୍ୱେଷଣ',
              hi: 'हमारे सौर मंडल की खोज'
            },
            content: {
              en: 'Learn about the planets, sun, and moon in our solar system.',
              od: 'ଆମ ସୌର ମଣ୍ଡଳରେ ଗ୍ରହ, ସୂର୍ଯ୍ୟ ଏବଂ ଚନ୍ଦ୍ର ବିଷୟରେ ଜାଣନ୍ତୁ।',
              hi: 'हमारे सौर मंडल में ग्रहों, सूर्य और चंद्रमा के बारे में जानें।'
            },
            culturalContext: {
              en: 'In Odisha, the Sun Temple at Konark represents our ancient understanding of astronomy.',
              od: 'ଓଡ଼ିଶାରେ, କୋଣାର୍କର ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଆମର ପ୍ରାଚୀନ ଜ୍ୟୋତିଷ ବିଜ୍ଞାନର ପ୍ରତିନିଧିତ୍ୱ କରେ।',
              hi: 'ओडिशा में, कोणार्क का सूर्य मंदिर हमारी प्राचीन खगोल विज्ञान की समझ का प्रतिनिधित्व करता है।'
            },
            tags: ['astronomy', 'planets', 'space'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Technology Content
          {
            subject: 'technology',
            topic: 'Introduction to Computers',
            grade: 5,
            difficulty: 'easy',
            type: 'lesson',
            title: {
              en: 'What is a Computer?',
              od: 'କମ୍ପ୍ୟୁଟର କଣ?',
              hi: 'कंप्यूटर क्या है?'
            },
            content: {
              en: 'Understanding the basics of computers and their uses in daily life.',
              od: 'କମ୍ପ୍ୟୁଟରର ମୌଳିକ ଏବଂ ଦୈନନ୍ଦିନ ଜୀବନରେ ଏହାର ବ୍ୟବହାର ବୁଝିବା।',
              hi: 'कंप्यूटर की बुनियादी बातें और दैनिक जीवन में इसके उपयोग को समझना।'
            },
            tags: ['computers', 'basics', 'digital literacy'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Engineering Content
          {
            subject: 'engineering',
            topic: 'Simple Machines',
            grade: 7,
            difficulty: 'medium',
            type: 'activity',
            title: {
              en: 'Building Simple Machines',
              od: 'ସରଳ ଯନ୍ତ୍ର ନିର୍ମାଣ',
              hi: 'सरल मशीनें बनाना'
            },
            content: {
              en: 'Learn about levers, pulleys, and wheels through hands-on activities.',
              od: 'ହାତରେ କାମ କରି ଲିଭର, ପୁଲି ଏବଂ ଚକ ବିଷୟରେ ଜାଣନ୍ତୁ।',
              hi: 'व्यावहारिक गतिविधियों के माध्यम से लीवर, पुली और पहियों के बारे में जानें।'
            },
            culturalContext: {
              en: 'Traditional Odia architecture uses many engineering principles in temple construction.',
              od: 'ପାରମ୍ପରିକ ଓଡ଼ିଆ ସ୍ଥାପତ୍ୟ ମନ୍ଦିର ନିର୍ମାଣରେ ଅନେକ ଇଞ୍ଜିନିୟରିଂ ସିଦ୍ଧାନ୍ତ ବ୍ୟବହାର କରେ।',
              hi: 'पारंपरिक ओडिया वास्तुकला मंदिर निर्माण में कई इंजीनियरिंग सिद्धांतों का उपयोग करती है।'
            },
            tags: ['machines', 'physics', 'hands-on'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // English Content
          {
            subject: 'english',
            topic: 'Basic Grammar',
            grade: 6,
            difficulty: 'easy',
            type: 'quiz',
            title: {
              en: 'Parts of Speech',
              od: 'ବାକ୍ୟର ଅଂଶ',
              hi: 'वाक्य के भाग'
            },
            content: {
              en: 'Learn about nouns, verbs, adjectives, and other parts of speech.',
              od: 'ବିଶେଷ୍ୟ, କ୍ରିୟା, ବିଶେଷଣ ଏବଂ ଅନ୍ୟାନ୍ୟ ବାକ୍ୟ ଅଂଶ ବିଷୟରେ ଜାଣନ୍ତୁ।',
              hi: 'संज्ञा, क्रिया, विशेषण और वाक्य के अन्य भागों के बारे में जानें।'
            },
            tags: ['grammar', 'language', 'basics'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Mathematics Content
          {
            subject: 'maths',
            topic: 'Fractions',
            grade: 5,
            difficulty: 'medium',
            type: 'lesson',
            title: {
              en: 'Understanding Fractions',
              od: 'ଭଗ୍ନାଂଶ ବୁଝିବା',
              hi: 'भिन्न को समझना'
            },
            content: {
              en: 'Learn how to work with fractions in everyday situations.',
              od: 'ଦୈନନ୍ଦିନ ପରିସ୍ଥିତିରେ ଭଗ୍ନାଂଶ ସହିତ କିପରି କାମ କରିବେ ଶିଖନ୍ତୁ।',
              hi: 'रोजमर्रा की स्थितियों में भिन्न के साथ काम करना सीखें।'
            },
            culturalContext: {
              en: 'Fractions are used in traditional Odia cooking recipes and measurements.',
              od: 'ପାରମ୍ପରିକ ଓଡ଼ିଆ ରନ୍ଧନ ରେସିପି ଏବଂ ମାପରେ ଭଗ୍ନାଂଶ ବ୍ୟବହୃତ ହୁଏ।',
              hi: 'पारंपरिक ओडिया खाना पकाने की विधियों और माप में भिन्न का उपयोग किया जाता है।'
            },
            tags: ['fractions', 'arithmetic', 'practical math'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          // Odissi Content
          {
            subject: 'odissi',
            topic: 'Introduction to Odissi Dance',
            grade: 5,
            difficulty: 'easy',
            type: 'story',
            title: {
              en: 'The Story of Odissi Dance',
              od: 'ଓଡ଼ିଶୀ ନୃତ୍ୟର କାହାଣୀ',
              hi: 'ओडिसी नृत्य की कहानी'
            },
            content: {
              en: 'Discover the ancient art form of Odissi dance and its cultural significance.',
              od: 'ଓଡ଼ିଶୀ ନୃତ୍ୟର ପ୍ରାଚୀନ କଳା ରୂପ ଏବଂ ଏହାର ସାଂସ୍କୃତିକ ମହତ୍ତ୍ୱ ଆବିଷ୍କାର କରନ୍ତୁ।',
              hi: 'ओडिसी नृत्य की प्राचीन कला और इसके सांस्कृतिक महत्व की खोज करें।'
            },
            culturalContext: {
              en: 'Odissi originated in the temples of Odisha and is one of the eight classical dances of India.',
              od: 'ଓଡ଼ିଶୀ ଓଡ଼ିଶାର ମନ୍ଦିରରେ ଉତ୍ପନ୍ନ ହୋଇଥିଲା ଏବଂ ଏହା ଭାରତର ଆଠଟି ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ମଧ୍ୟରୁ ଗୋଟିଏ।',
              hi: 'ओडिसी की उत्पत्ति ओडिशा के मंदिरों में हुई और यह भारत के आठ शास्त्रीय नृत्यों में से एक है।'
            },
            tags: ['culture', 'dance', 'tradition', 'art'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        await db.content.bulkAdd(seedData);
        console.log('Content seeded successfully');
      }
    } catch (error) {
      console.error('Content seeding error:', error);
      throw error;
    }
  }

  static async getContent(filters?: {
    subject?: string;
    grade?: number;
    type?: string;
    difficulty?: string;
  }): Promise<ContentData[]> {
    try {
      let collection = db.content.toCollection();

      if (filters?.subject) {
        collection = collection.filter(item => item.subject === filters.subject);
      }
      if (filters?.grade) {
        collection = collection.filter(item => item.grade === filters.grade);
      }
      if (filters?.type) {
        collection = collection.filter(item => item.type === filters.type);
      }
      if (filters?.difficulty) {
        collection = collection.filter(item => item.difficulty === filters.difficulty);
      }

      return await collection.toArray();
    } catch (error) {
      console.error('Get content error:', error);
      throw error;
    }
  }

  static async createContent(content: Omit<ContentData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentData> {
    try {
      const newContent: ContentData = {
        ...content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const contentId = await db.content.add(newContent);
      return { ...newContent, id: contentId as number };
    } catch (error) {
      console.error('Create content error:', error);
      throw error;
    }
  }

  static async updateContent(id: number, updates: Partial<ContentData>): Promise<void> {
    try {
      await db.content.update(id, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Update content error:', error);
      throw error;
    }
  }

  static async deleteContent(id: number): Promise<void> {
    try {
      await db.content.delete(id);
    } catch (error) {
      console.error('Delete content error:', error);
      throw error;
    }
  }
}

// Initialize database and seed content on first load
export const initializeDatabase = async () => {
  try {
    await db.open();
    await ContentService.seedContent();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

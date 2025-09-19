"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "od" | "hi"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

const translations = {
  en: {
    // Common
    "common.welcome": "Welcome",
    "common.login": "Login",
    "common.register": "Register",
    "common.logout": "Logout",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.continue": "Continue",
    "common.back": "Back",
    "common.next": "Next",
    "common.loading": "Loading...",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.lessons": "Lessons",
    "nav.games": "Games",
    "nav.profile": "Profile",
    "nav.achievements": "Achievements",

    // Game elements
    "game.points": "Points",
    "game.level": "Level",
    "game.streak": "Streak",
    "game.badges": "Badges",
    "game.day": "Day",
    "game.days": "Days",

    // Subjects
    "subjects.math": "Mathematics",
    "subjects.science": "Science",
    "subjects.english": "English",
    "subjects.odia": "Odia",
    "subjects.social": "Social Studies",

    // Achievements
    "achievements.first_login": "First Steps",
    "achievements.week_warrior": "Week Warrior",
    "achievements.quiz_master": "Quiz Master",
    "achievements.subject_expert": "Subject Expert",
    "achievements.streak_master": "Streak Master",

    // Student Dashboard
    "student.welcome_back": "Welcome back",
    "student.stem_adventure": "Ready to continue your STEM adventure? You're doing amazing!",
    "student.total_stars_earned": "Total Stars Earned",
    "student.earn_stars_message": "Earn stars by completing lessons and quizzes!",
    "student.active": "Active",
    "student.next_reward": "Next Reward: Week Warrior",
    "student.days_to_go": "more days to go!",
    "student.best_streak": "Best Streak",
    "student.your_badges": "Your Badges",
    "student.earned": "earned",
    "student.complete_lessons_badge": "Complete lessons and quizzes to earn your first badge!",
    "student.subject_progress": "Subject Progress",
    "student.learning_summary": "Learning Summary",
    "student.lessons_completed": "Lessons Completed",
    "student.overall_progress": "Overall Progress",
    "student.subjects_mastered": "Subjects Mastered",
    "student.global_rank": "Global Rank",
    "student.recent_achievements": "Recent Achievements",
    "student.upcoming_events": "Upcoming Events",
    "student.view_all_achievements": "View All Achievements",
    "student.join_event": "Join Event",

    // Teacher Dashboard
    "teacher.dashboard": "Teacher Dashboard",
    "teacher.welcome_back": "Welcome back, Ravi Kumar!",
    "teacher.grade_students": "Grade 8A (24 students)",
    "teacher.total_students": "Total Students",
    "teacher.active_today": "Active Today",
    "teacher.avg_level": "Avg Level",
    "teacher.overview": "Overview",
    "teacher.students": "Students",
    "teacher.assignments": "Assignments",
    "teacher.analytics": "Analytics",
    "teacher.resources": "Resources",
    "teacher.recent_activity": "Recent Activity",
    "teacher.quick_actions": "Quick Actions",
    "teacher.create_assignment": "Create Assignment",
    "teacher.view_analytics": "View Analytics",
    "teacher.message_students": "Message Students",
    "teacher.lesson_plans": "Lesson Plans",
    "teacher.no_assignments": "No assignments created yet",
    "teacher.no_resources": "No resources available yet",
    "teacher.add_resource": "Add Resource",
    "teacher.subject_performance": "Subject Performance",
    "teacher.language_usage": "Language Usage",

    // Leaderboard
    "leaderboard.title": "Leaderboard",
    "leaderboard.compete_message": "Compete with fellow Knowledge Guardians",
    "leaderboard.your_rank": "Your Rank",
    "leaderboard.total_xp": "Total XP",
    "leaderboard.day_streak": "Day Streak",
    "leaderboard.global": "Global",
    "leaderboard.school": "School",
    "leaderboard.friends": "Friends",
    "leaderboard.top_performers": "Top Performers",
    "leaderboard.full_rankings": "Full Rankings",
    "leaderboard.back_to_dashboard": "Back to Dashboard",

    // Quiz
    "quiz.xp_earned": "XP Earned",
    "quiz.correct_answers": "Correct Answers",
    "quiz.submit": "Submit Answer",
    "quiz.next_question": "Next Question",
    "quiz.complete": "Complete Quiz",
    "quiz.score": "Your Score",
    
    // Login/Register
    "auth.login_title": "Welcome to SHIKSHA",
    "auth.register_title": "Join SHIKSHA",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.name": "Full Name",
    "auth.grade": "Grade",
    "auth.school": "School Name",
    "auth.remember_me": "Remember Me",
    "auth.forgot_password": "Forgot Password?",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
    "auth.register_now": "Register Now",
    "auth.login_now": "Login Now",
    "auth.student_login": "Student Login",
    "auth.teacher_login": "Teacher Login",
    
    // Buttons
    "button.start_learning": "Start Learning",
    "button.view_progress": "View Progress",
    "button.take_quiz": "Take Quiz",
    "button.play_game": "Play Game",
    "button.view_lessons": "View Lessons",
    "button.settings": "Settings",
    "button.help": "Help",
    "button.notifications": "Notifications",
  },
  od: {
    // Common
    "common.welcome": "ସ୍ୱାଗତ",
    "common.login": "ଲଗଇନ୍",
    "common.register": "ପଞ୍ଜୀକରଣ",
    "common.logout": "ଲଗଆଉଟ୍",
    "common.save": "ସେଭ୍",
    "common.cancel": "ବାତିଲ୍",
    "common.continue": "ଆଗକୁ ବଢ଼ନ୍ତୁ",
    "common.back": "ପଛକୁ",
    "common.next": "ପରବର୍ତ୍ତୀ",
    "common.loading": "ଲୋଡ୍ ହେଉଛି...",

    // Navigation
    "nav.dashboard": "ଡ୍ୟାସବୋର୍ଡ",
    "nav.lessons": "ପାଠ",
    "nav.games": "ଖେଳ",
    "nav.profile": "ପ୍ରୋଫାଇଲ୍",
    "nav.achievements": "ସଫଳତା",

    // Game elements
    "game.points": "ପଏଣ୍ଟ",
    "game.level": "ସ୍ତର",
    "game.streak": "ଧାରା",
    "game.badges": "ବ୍ୟାଜ୍",
    "game.day": "ଦିନ",
    "game.days": "ଦିନ",

    // Subjects
    "subjects.math": "ଗଣିତ",
    "subjects.science": "ବିଜ୍ଞାନ",
    "subjects.english": "ଇଂରାଜୀ",
    "subjects.odia": "ଓଡ଼ିଆ",
    "subjects.social": "ସାମାଜିକ ବିଜ୍ଞାନ",

    // Achievements
    "achievements.first_login": "ପ୍ରଥମ ପଦକ୍ଷେପ",
    "achievements.week_warrior": "ସପ୍ତାହ ଯୋଦ୍ଧା",
    "achievements.quiz_master": "କୁଇଜ୍ ମାଷ୍ଟର",
    "achievements.subject_expert": "ବିଷୟ ବିଶେଷଜ୍ଞ",
    "achievements.streak_master": "ଧାରା ମାଷ୍ଟର",

    // Student Dashboard
    "student.welcome_back": "ପୁନର୍ବାର ସ୍ୱାଗତ",
    "student.stem_adventure": "ଆପଣଙ୍କ STEM ଦୁଃସାହସିକ କାର୍ଯ୍ୟ ଜାରି ରଖିବାକୁ ପ୍ରସ୍ତୁତ? ଆପଣ ଅଦ୍ଭୁତ କାମ କରୁଛନ୍ତି!",
    "student.total_stars_earned": "ମୋଟ ତାରକା ଅର୍ଜିତ",
    "student.earn_stars_message": "ପାଠ ଏବଂ କୁଇଜ୍ ସମାପ୍ତ କରି ତାରକା ଅର୍ଜନ କରନ୍ତୁ!",
    "student.active": "ସକ୍ରିୟ",
    "student.next_reward": "ପରବର୍ତ୍ତୀ ପୁରସ୍କାର: ସପ୍ତାହ ଯୋଦ୍ଧା",
    "student.days_to_go": "ଅଧିକ ଦିନ ବାକି!",
    "student.best_streak": "ସର୍ବୋତ୍ତମ ଧାରା",
    "student.your_badges": "ଆପଣଙ୍କ ବ୍ୟାଜ୍",
    "student.earned": "ଅର୍ଜିତ",
    "student.complete_lessons_badge": "ଆପଣଙ୍କର ପ୍ରଥମ ବ୍ୟାଜ୍ ଅର୍ଜନ କରିବାକୁ ପାଠ ଏବଂ କୁଇଜ୍ ସମାପ୍ତ କରନ୍ତୁ!",
    "student.subject_progress": "ବିଷୟ ଅଗ୍ରଗତି",
    "student.learning_summary": "ଶିକ୍ଷା ସାରାଂଶ",
    "student.lessons_completed": "ପାଠ ସମାପ୍ତ",
    "student.overall_progress": "ସାମଗ୍ରିକ ଅଗ୍ରଗତି",
    "student.subjects_mastered": "ବିଷୟ ଦକ୍ଷତା",
    "student.global_rank": "ବିଶ୍ୱ ର୍ୟାଙ୍କ",
    "student.recent_achievements": "ସାମ୍ପ୍ରତିକ ସଫଳତା",
    "student.upcoming_events": "ଆଗାମୀ ଘଟଣା",
    "student.view_all_achievements": "ସମସ୍ତ ସଫଳତା ଦେଖନ୍ତୁ",
    "student.join_event": "ଘଟଣାରେ ଯୋଗ ଦିଅନ୍ତୁ",

    // Teacher Dashboard
    "teacher.dashboard": "ଶିକ୍ଷକ ଡ୍ୟାସବୋର୍ଡ",
    "teacher.welcome_back": "ପୁନର୍ବାର ସ୍ୱାଗତ, ରବି କୁମାର!",
    "teacher.grade_students": "ଶ୍ରେଣୀ 8A (24 ଛାତ୍ର)",
    "teacher.total_students": "ମୋଟ ଛାତ୍ର",
    "teacher.active_today": "ଆଜି ସକ୍ରିୟ",
    "teacher.avg_level": "ହାରାହାରି ସ୍ତର",
    "teacher.overview": "ସମୀକ୍ଷା",
    "teacher.students": "ଛାତ୍ରମାନେ",
    "teacher.assignments": "ଆସାଇନମେଣ୍ଟ",
    "teacher.analytics": "ବିଶ୍ଳେଷଣ",
    "teacher.resources": "ସମ୍ବଳ",
    "teacher.recent_activity": "ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ",
    "teacher.quick_actions": "ଦ୍ରୁତ କାର୍ଯ୍ୟ",
    "teacher.create_assignment": "ଆସାଇନମେଣ୍ଟ ସୃଷ୍ଟି କରନ୍ତୁ",
    "teacher.view_analytics": "ବିଶ୍ଳେଷଣ ଦେଖନ୍ତୁ",
    "teacher.message_students": "ଛାତ୍ରମାନଙ୍କୁ ସନ୍ଦେଶ",
    "teacher.lesson_plans": "ପାଠ ଯୋଜନା",
    "teacher.no_assignments": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଆସାଇନମେଣ୍ଟ ସୃଷ୍ଟି ହୋଇନାହିଁ",
    "teacher.no_resources": "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ସମ୍ବଳ ଉପଲବ୍ଧ ନାହିଁ",
    "teacher.add_resource": "ସମ୍ବଳ ଯୋଗ କରନ୍ତୁ",
    "teacher.subject_performance": "ବିଷୟ ପ୍ରଦର୍ଶନ",
    "teacher.language_usage": "ଭାଷା ବ୍ୟବହାର",

    // Leaderboard
    "leaderboard.title": "ଲିଡରବୋର୍ଡ",
    "leaderboard.compete_message": "ସାଥୀ ଜ୍ଞାନ ରକ୍ଷକମାନଙ୍କ ସହ ପ୍ରତିଯୋଗିତା କରନ୍ତୁ",
    "leaderboard.your_rank": "ଆପଣଙ୍କ ର୍ୟାଙ୍କ",
    "leaderboard.total_xp": "ମୋଟ XP",
    "leaderboard.day_streak": "ଦିନ ଧାରା",
    "leaderboard.global": "ବିଶ୍ୱବ୍ୟାପୀ",
    "leaderboard.school": "ବିଦ୍ୟାଳୟ",
    "leaderboard.friends": "ବନ୍ଧୁଗଣ",
    "leaderboard.top_performers": "ଶୀର୍ଷ ପ୍ରଦର୍ଶନକାରୀ",
    "leaderboard.full_rankings": "ସମ୍ପୂର୍ଣ୍ଣ ର୍ୟାଙ୍କିଂ",
    "leaderboard.back_to_dashboard": "ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ",

    // Quiz
    "quiz.xp_earned": "XP ଅର୍ଜିତ",
    "quiz.correct_answers": "ସଠିକ ଉତ୍ତର",
    "quiz.submit": "ଉତ୍ତର ଦାଖଲ କରନ୍ତୁ",
    "quiz.next_question": "ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ",
    "quiz.complete": "କୁଇଜ୍ ସମାପ୍ତ କରନ୍ତୁ",
    "quiz.score": "ଆପଣଙ୍କ ସ୍କୋର",
    
    // Login/Register
    "auth.login_title": "SHIKSHA କୁ ସ୍ୱାଗତ",
    "auth.register_title": "SHIKSHA ରେ ଯୋଗ ଦିଅନ୍ତୁ",
    "auth.email": "ଇମେଲ୍ ଠିକଣା",
    "auth.password": "ପାସୱାର୍ଡ",
    "auth.name": "ପୂର୍ଣ୍ଣ ନାମ",
    "auth.grade": "ଶ୍ରେଣୀ",
    "auth.school": "ବିଦ୍ୟାଳୟ ନାମ",
    "auth.remember_me": "ମୋତେ ମନେ ରଖନ୍ତୁ",
    "auth.forgot_password": "ପାସୱାର୍ଡ ଭୁଲି ଯାଇଛନ୍ତି?",
    "auth.no_account": "ଆକାଉଣ୍ଟ ନାହିଁ?",
    "auth.have_account": "ପୂର୍ବରୁ ଆକାଉଣ୍ଟ ଅଛି?",
    "auth.register_now": "ବର୍ତ୍ତମାନ ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    "auth.login_now": "ବର୍ତ୍ତମାନ ଲଗଇନ୍ କରନ୍ତୁ",
    "auth.student_login": "ଛାତ୍ର ଲଗଇନ୍",
    "auth.teacher_login": "ଶିକ୍ଷକ ଲଗଇନ୍",
    
    // Buttons
    "button.start_learning": "ଶିକ୍ଷା ଆରମ୍ଭ କରନ୍ତୁ",
    "button.view_progress": "ଅଗ୍ରଗତି ଦେଖନ୍ତୁ",
    "button.take_quiz": "କୁଇଜ୍ ନିଅନ୍ତୁ",
    "button.play_game": "ଖେଳ ଖେଳନ୍ତୁ",
    "button.view_lessons": "ପାଠ ଦେଖନ୍ତୁ",
    "button.settings": "ସେଟିଂସ୍",
    "button.help": "ସହାୟତା",
    "button.notifications": "ବିଜ୍ଞପ୍ତି",
  },
  hi: {
    // Common
    "common.welcome": "स्वागत",
    "common.login": "लॉगिन",
    "common.register": "पंजीकरण",
    "common.logout": "लॉगआउट",
    "common.save": "सेव",
    "common.cancel": "रद्द करें",
    "common.continue": "आगे बढ़ें",
    "common.back": "वापस",
    "common.next": "अगला",
    "common.loading": "लोड हो रहा है...",

    // Navigation
    "nav.dashboard": "डैशबोर्ड",
    "nav.lessons": "पाठ",
    "nav.games": "खेल",
    "nav.profile": "प्रोफाइल",
    "nav.achievements": "उपलब्धियां",

    // Game elements
    "game.points": "अंक",
    "game.level": "स्तर",
    "game.streak": "श्रृंखला",
    "game.badges": "बैज",
    "game.day": "दिन",
    "game.days": "दिन",

    // Subjects
    "subjects.math": "गणित",
    "subjects.science": "विज्ञान",
    "subjects.english": "अंग्रेजी",
    "subjects.odia": "ओडिया",
    "subjects.social": "सामाजिक विज्ञान",

    // Achievements
    "achievements.first_login": "पहला कदम",
    "achievements.week_warrior": "सप्ताह योद्धा",
    "achievements.quiz_master": "क्विज मास्टर",
    "achievements.subject_expert": "विषय विशेषज्ञ",
    "achievements.streak_master": "श्रृंखला मास्टर",

    // Student Dashboard
    "student.welcome_back": "वापस स्वागत है",
    "student.stem_adventure": "अपना STEM साहसिक कार्य जारी रखने के लिए तैयार? आप अद्भुत काम कर रहे हैं!",
    "student.total_stars_earned": "कुल तारे अर्जित",
    "student.earn_stars_message": "पाठ और क्विज़ पूरे करके तारे अर्जित करें!",
    "student.active": "सक्रिय",
    "student.next_reward": "अगला पुरस्कार: सप्ताह योद्धा",
    "student.days_to_go": "और दिन बाकी!",
    "student.best_streak": "सर्वश्रेष्ठ श्रृंखला",
    "student.your_badges": "आपके बैज",
    "student.earned": "अर्जित",
    "student.complete_lessons_badge": "अपना पहला बैज अर्जित करने के लिए पाठ और क्विज़ पूरे करें!",
    "student.subject_progress": "विषय प्रगति",
    "student.learning_summary": "शिक्षा सारांश",
    "student.lessons_completed": "पाठ पूर्ण",
    "student.overall_progress": "समग्र प्रगति",
    "student.subjects_mastered": "विषय दक्षता",
    "student.global_rank": "वैश्विक रैंक",
    "student.recent_achievements": "हाल की उपलब्धियां",
    "student.upcoming_events": "आगामी कार्यक्रम",
    "student.view_all_achievements": "सभी उपलब्धियां देखें",
    "student.join_event": "कार्यक्रम में शामिल हों",

    // Teacher Dashboard
    "teacher.dashboard": "शिक्षक डैशबोर्ड",
    "teacher.welcome_back": "वापस स्वागत है, रवि कुमार!",
    "teacher.grade_students": "कक्षा 8A (24 छात्र)",
    "teacher.total_students": "कुल छात्र",
    "teacher.active_today": "आज सक्रिय",
    "teacher.avg_level": "औसत स्तर",
    "teacher.overview": "समीक्षा",
    "teacher.students": "छात्र",
    "teacher.assignments": "असाइनमेंट",
    "teacher.analytics": "विश्लेषण",
    "teacher.resources": "संसाधन",
    "teacher.recent_activity": "हाल की गतिविधि",
    "teacher.quick_actions": "त्वरित कार्य",
    "teacher.create_assignment": "असाइनमेंट बनाएं",
    "teacher.view_analytics": "विश्लेषण देखें",
    "teacher.message_students": "छात्रों को संदेश",
    "teacher.lesson_plans": "पाठ योजना",
    "teacher.no_assignments": "अभी तक कोई असाइनमेंट नहीं बनाया गया",
    "teacher.no_resources": "अभी तक कोई संसाधन उपलब्ध नहीं",
    "teacher.add_resource": "संसाधन जोड़ें",
    "teacher.subject_performance": "विषय प्रदर्शन",
    "teacher.language_usage": "भाषा उपयोग",

    // Leaderboard
    "leaderboard.title": "लीडरबोर्ड",
    "leaderboard.compete_message": "साथी ज्ञान संरक्षकों के साथ प्रतिस्पर्धा करें",
    "leaderboard.your_rank": "आपकी रैंक",
    "leaderboard.total_xp": "कुल XP",
    "leaderboard.day_streak": "दिन श्रृंखला",
    "leaderboard.global": "वैश्विक",
    "leaderboard.school": "स्कूल",
    "leaderboard.friends": "मित्र",
    "leaderboard.top_performers": "शीर्ष प्रदर्शनकर्ता",
    "leaderboard.full_rankings": "पूर्ण रैंकिंग",
    "leaderboard.back_to_dashboard": "डैशबोर्ड पर वापस जाएं",

    // Quiz
    "quiz.xp_earned": "XP अर्जित",
    "quiz.correct_answers": "सही उत्तर",
    "quiz.submit": "उत्तर जमा करें",
    "quiz.next_question": "अगला प्रश्न",
    "quiz.complete": "क्विज़ पूर्ण करें",
    "quiz.score": "आपका स्कोर",
    
    // Login/Register
    "auth.login_title": "SHIKSHA में आपका स्वागत है",
    "auth.register_title": "SHIKSHA से जुड़ें",
    "auth.email": "ईमेल पता",
    "auth.password": "पासवर्ड",
    "auth.name": "पूरा नाम",
    "auth.grade": "कक्षा",
    "auth.school": "स्कूल का नाम",
    "auth.remember_me": "मुझे याद रखें",
    "auth.forgot_password": "पासवर्ड भूल गए?",
    "auth.no_account": "खाता नहीं है?",
    "auth.have_account": "पहले से खाता है?",
    "auth.register_now": "अभी पंजीकरण करें",
    "auth.login_now": "अभी लॉगिन करें",
    "auth.student_login": "छात्र लॉगिन",
    "auth.teacher_login": "शिक्षक लॉगिन",
    
    // Buttons
    "button.start_learning": "सीखना शुरू करें",
    "button.view_progress": "प्रगति देखें",
    "button.take_quiz": "क्विज़ लें",
    "button.play_game": "गेम खेलें",
    "button.view_lessons": "पाठ देखें",
    "button.settings": "सेटिंग्स",
    "button.help": "मदद",
    "button.notifications": "सूचनाएं",
  },
}

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("shiksha-language") as Language
    if (savedLanguage && ["en", "od", "hi"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("shiksha-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

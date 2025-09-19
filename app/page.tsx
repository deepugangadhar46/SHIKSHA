"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [showWelcome, setShowWelcome] = useState(true)
  const router = useRouter()

  const languages = {
    en: {
      title: "Welcome to SHIKSHA",
      subtitle: "Your Journey to Knowledge Begins Here",
      studentButton: "I am a Student",
      teacherButton: "I am a Teacher",
      features: [
        "Interactive Learning Games",
        "Cultural Stories from Odisha",
        "Voice-Guided Lessons",
        "Earn Badges & Rewards",
      ],
    },
    od: {
      title: "SHIKSHA ରେ ସ୍ୱାଗତ",
      subtitle: "ଆପଣଙ୍କ ଜ୍ଞାନ ଯାତ୍ରା ଏଠାରୁ ଆରମ୍ଭ",
      studentButton: "ମୁଁ ଜଣେ ଛାତ୍ର",
      teacherButton: "ମୁଁ ଜଣେ ଶିକ୍ଷକ",
      features: ["ଇଣ୍ଟରାକ୍ଟିଭ ଶିକ୍ଷା ଖେଳ", "ଓଡ଼ିଶାର ସାଂସ୍କୃତିକ କାହାଣୀ", "ସ୍ୱର-ନିର୍ଦ୍ଦେଶିତ ପାଠ", "ବ୍ୟାଜ ଓ ପୁରସ୍କାର ଅର୍ଜନ କରନ୍ତୁ"],
    },
    hi: {
      title: "SHIKSHA में आपका स्वागत है",
      subtitle: "आपकी ज्ञान यात्रा यहाँ से शुरू होती है",
      studentButton: "मैं एक छात्र हूँ",
      teacherButton: "मैं एक शिक्षक हूँ",
      features: ["इंटरैक्टिव लर्निंग गेम्स", "ओडिशा की सांस्कृतिक कहानियाँ", "आवाज़-निर्देशित पाठ", "बैज और पुरस्कार जीतें"],
    },
  }

  const currentText = languages[currentLanguage as keyof typeof languages]

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/90 to-secondary/90"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center text-white"
            >
              <div className="text-8xl mb-4 float-animation">🎓</div>
              <h1 className="text-4xl font-bold mb-2">SHIKSHA</h1>
              <p className="text-xl opacity-90">ଶିକ୍ଷା ଯାତ୍ରା • Learning Journey</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-24 h-24 bg-secondary/5 rounded-full blur-xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent/5 rounded-full blur-xl"
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>
        {/* Language Selector */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mb-8">
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            {Object.keys(languages).map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentLanguage === lang
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "en" ? "English" : lang === "od" ? "ଓଡ଼ିଆ" : "हिंदी"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="text-6xl float-animation"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              🏛️
            </motion.div>
          </div>

          <h1 className="text-5xl font-bold text-foreground mb-4 text-balance">{currentText.title}</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">{currentText.subtitle}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 btn-professional pulse-glow shadow-xl hover:shadow-2xl transition-all duration-300 border-0"
                onClick={() => router.push('/login?role=student')}
              >
                <motion.span 
                  className="mr-3 text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  🎓
                </motion.span>
                <span className="font-semibold">{currentText.studentButton}</span>
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }} 
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <Button 
                size="lg" 
                className="text-lg px-10 py-7 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 btn-professional shadow-xl hover:shadow-2xl transition-all duration-300 border-0 text-secondary-foreground"
                onClick={() => router.push('/login?role=teacher')}
              >
                <motion.span 
                  className="mr-3 text-2xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  👩‍🏫
                </motion.span>
                <span className="font-semibold">{currentText.teacherButton}</span>
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-lg"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {currentText.features.map((feature, index) => {
            const icons = ["🎮", "📚", "🎤", "🏆"];
            const gradients = [
              "from-blue-400 to-purple-500",
              "from-green-400 to-blue-500", 
              "from-purple-400 to-pink-500",
              "from-yellow-400 to-orange-500"
            ];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.6 + index * 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 10
                }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card className="glass-card h-full card-hover relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <CardContent className="p-8 text-center relative z-10">
                    <motion.div 
                      className="text-5xl mb-6 inline-block"
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: [0, -10, 10, -5, 5, 0],
                        transition: { duration: 0.6 }
                      }}
                    >
                      {icons[index]}
                    </motion.div>
                    <motion.p 
                      className="font-semibold text-foreground text-lg leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature}
                    </motion.p>
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Cultural Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden"
        >
          <div className="glass-card p-10 text-center relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-primary rounded-full animate-pulse" />
              <div className="absolute top-8 right-8 w-12 h-12 border-2 border-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-6 left-8 w-20 h-20 border-2 border-accent rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
            
            <div className="flex justify-center gap-6 mb-6 text-5xl relative z-10">
              <motion.span
                className="inline-block cursor-pointer"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut"
                }}
                whileHover={{ scale: 1.3, rotate: 20 }}
              >
                🎭
              </motion.span>
              <motion.span
                className="inline-block cursor-pointer"
                animate={{ 
                  scale: [1, 1.2, 1],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                whileHover={{ scale: 1.3, y: -10 }}
              >
                🏺
              </motion.span>
              <motion.span
                className="inline-block cursor-pointer"
                animate={{ 
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1
                }}
                whileHover={{ scale: 1.3, rotate: -20 }}
              >
                💃
              </motion.span>
              <motion.span
                className="inline-block cursor-pointer"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1.5
                }}
                whileHover={{ scale: 1.3, rotate: 15 }}
              >
                🎨
              </motion.span>
            </div>
            
            <motion.h2 
              className="text-3xl font-bold mb-4 gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {currentLanguage === "od"
                ? "ଓଡ଼ିଶାର ସଂସ୍କୃତି"
                : currentLanguage === "hi"
                  ? "ओडिशा की संस्कृति"
                  : "Celebrating Odisha Culture"}
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              {currentLanguage === "od"
                ? "ଆମର ସମୃଦ୍ଧ ସାଂସ୍କୃତିକ ଐତିହ୍ୟ ସହିତ ଶିଖନ୍ତୁ - ଓଡ଼ିଶୀ ନୃତ୍ୟ, ପାରମ୍ପରିକ କଳା ଏବଂ ଇତିହାସ"
                : currentLanguage === "hi"
                  ? "हमारी समृद्ध सांस्कृतिक विरासत के साथ सीखें - ओडिसी नृत्य, पारंपरिक कला और इतिहास"
                  : "Learn with our rich cultural heritage - Odissi dance, traditional arts, and history"}
            </motion.p>
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-50" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-secondary to-primary opacity-50" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { useAccessibility } from "@/contexts/accessibility-context"

interface LanguageSelectorProps {
  variant?: "default" | "compact" | "dropdown"
  className?: string
}

export function LanguageSelector({ variant = "default", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage()
  const { speak } = useAccessibility()

  const languages = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "od", name: "Odia", nativeName: "ଓଡ଼ିଆ", flag: "🏛️" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  ]

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as "en" | "od" | "hi")
    const selectedLang = languages.find((l) => l.code === langCode)
    if (selectedLang) {
      speak(`Language changed to ${selectedLang.name}`)
    }
  }

  if (variant === "compact") {
    return (
      <div className={`flex gap-1 ${className}`}>
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-2 py-1 rounded text-xs font-medium transition-all
              ${
                language === lang.code
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {lang.flag}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex gap-2 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg ${className}`}>
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
            ${
              language === lang.code
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{lang.flag}</span>
          <span>{lang.nativeName}</span>
        </motion.button>
      ))}
    </div>
  )
}

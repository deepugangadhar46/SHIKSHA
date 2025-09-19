"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/ui/language-selector"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "teacher",
    grade: "",
    school: "",
  })
  const [rememberMe, setRememberMe] = useState(false)

  const { login, register, isLoading, error, clearError } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get role from URL params
  useEffect(() => {
    const role = searchParams.get("role")
    if (role === "student" || role === "teacher") {
      setFormData((prev) => ({ ...prev, role }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isLogin) {
        await login(formData.email, formData.password, rememberMe)
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          grade: formData.grade ? parseInt(formData.grade) : undefined,
          school: formData.school,
        })
      }

      // Redirect based on role
      if (formData.role === "student") {
        router.push("/student")
      } else {
        router.push("/teacher")
      }
    } catch (err) {
      console.error("Auth error:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Remove local translations and use global translation system
  const getTranslatedText = (key: string) => {
    return t(key) || key
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Language Selector */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Link>
          <LanguageSelector variant="compact" />
        </div>

        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">
              {formData.role === "student" ? "🎓" : "👩‍🏫"}
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? t("auth.login_title") : t("auth.register_title")}
            </CardTitle>
            <CardDescription>
              {isLogin ? 
                (language === "od" ? "ଆପଣଙ୍କ ଶିକ୍ଷା ଯାତ୍ରା ଜାରି ରଖିବାକୁ ସାଇନ ଇନ କରନ୍ତୁ" :
                 language === "hi" ? "अपनी सीखने की यात्रा जारी रखने के लिए साइन इन करें" :
                 "Sign in to continue your learning journey") :
                (language === "od" ? "ଶିଖିବା ଆରମ୍ଭ କରିବାକୁ ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ" :
                 language === "hi" ? "सीखना शुरू करने के लिए अपना खाता बनाएं" :
                 "Create your account to start learning")
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label>
                  {language === "od" ? "ମୁଁ ଜଣେ" : language === "hi" ? "मैं एक हूँ" : "I am a"}
                </Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.role === "student" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setFormData((prev) => ({ ...prev, role: "student" }))}
                  >
                    🎓 {language === "od" ? "ଛାତ୍ର" : language === "hi" ? "छात्र" : "Student"}
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === "teacher" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setFormData((prev) => ({ ...prev, role: "teacher" }))}
                  >
                    👩‍🏫 {language === "od" ? "ଶିକ୍ଷକ" : language === "hi" ? "शिक्षक" : "Teacher"}
                  </Button>
                </div>
              </div>

              {/* Name field for registration */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    placeholder={t("auth.name")}
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t("auth.email")}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder={t("auth.password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember Me checkbox - only for login */}
              {isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("auth.remember_me")}
                  </Label>
                </div>
              )}

              {/* Additional fields for registration */}
              {!isLogin && (
                <>
                  {formData.role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="grade">{t("auth.grade")}</Label>
                      <Input
                        id="grade"
                        name="grade"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="8"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="school">{t("auth.school")}</Label>
                    <Input
                      id="school"
                      name="school"
                      type="text"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder={t("auth.school")}
                    />
                  </div>
                </>
              )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isLogin ? t("common.login") : t("common.register")}
                  </div>
                ) : (
                  <>{isLogin ? t("common.login") : t("common.register")}</>
                )}
              </Button>

              {/* Switch between login/register */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    clearError()
                  }}
                  className="text-sm"
                >
                  {isLogin ? t("auth.no_account") : t("auth.have_account")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

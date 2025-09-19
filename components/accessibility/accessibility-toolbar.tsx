"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useAccessibility } from "@/contexts/accessibility-context"
import { useLanguage } from "@/contexts/language-context"

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { settings, updateSettings } = useAccessibility()
  const { t } = useLanguage()

  const accessibilityOptions = [
    {
      key: "reducedMotion",
      label: t("accessibility.reduced_motion") || "Reduce Motion",
      description: t("accessibility.reduced_motion_desc") || "Minimize animations and transitions",
      icon: "🎭",
    },
    {
      key: "highContrast",
      label: t("accessibility.high_contrast") || "High Contrast",
      description: t("accessibility.high_contrast_desc") || "Increase color contrast for better visibility",
      icon: "🌓",
    },
    {
      key: "largeText",
      label: t("accessibility.large_text") || "Large Text",
      description: t("accessibility.large_text_desc") || "Increase text size for better readability",
      icon: "🔍",
    },
    {
      key: "voiceEnabled",
      label: t("accessibility.voice_enabled") || "Voice Narration",
      description: t("accessibility.voice_enabled_desc") || "Enable text-to-speech for content",
      icon: "🎤",
    },
    {
      key: "keyboardNavigation",
      label: t("accessibility.keyboard_nav") || "Keyboard Navigation",
      description: t("accessibility.keyboard_nav_desc") || "Enhanced keyboard navigation support",
      icon: "⌨️",
    },
  ]

  return (
    <>
      {/* Accessibility Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          aria-label={t("accessibility.open_toolbar") || "Open accessibility toolbar"}
        >
          <motion.span className="text-2xl" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            ♿
          </motion.span>
        </Button>
      </motion.div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {t("accessibility.settings") || "Accessibility Settings"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  {accessibilityOptions.map((option, index) => (
                    <motion.div
                      key={option.key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-foreground">{option.label}</h3>
                                <Switch
                                  checked={settings[option.key as keyof typeof settings] as boolean}
                                  onCheckedChange={(checked) => updateSettings({ [option.key]: checked })}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <h3 className="font-semibold text-foreground">
                      {t("accessibility.quick_actions") || "Quick Actions"}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSettings({
                            reducedMotion: false,
                            highContrast: false,
                            largeText: false,
                          })
                        }
                        className="text-xs"
                      >
                        🔄 {t("accessibility.reset") || "Reset"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateSettings({
                            reducedMotion: true,
                            highContrast: true,
                            largeText: true,
                            voiceEnabled: true,
                          })
                        }
                        className="text-xs"
                      >
                        🚀 {t("accessibility.max_accessibility") || "Max Access"}
                      </Button>
                    </div>
                  </motion.div>

                  {/* Help Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-primary/10 rounded-lg p-4"
                  >
                    <h3 className="font-semibold text-primary mb-2">{t("accessibility.help") || "Need Help?"}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("accessibility.help_desc") || "These settings help make learning easier for everyone."}
                    </p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      📞 {t("accessibility.contact_support") || "Contact Support"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// EduQuest platform configuration derived from user-provided JSON
export const eduQuestPlatform = {
  globalSettings: {
    platform: 'HTML5',
    targetDevice: 'desktop',
    animations: {
      engine: 'CSS3_JS',
      frameRate: 60,
      particleEffects: true,
      characterAnimations: true,
    },
    audio: {
      backgroundMusic: true,
      soundEffects: true,
      voiceNarration: true,
    },
  },
  characterProgression: {
    avatars: [
      {
        id: 'scientist_sam',
        name: 'Scientist Sam',
        description: 'A curious lab researcher who loves experiments',
        unlockCondition: 'default',
        abilities: ['chemistry_boost', 'lab_safety'],
      },
      {
        id: 'engineer_emma',
        name: 'Engineer Emma',
        description: 'Creative builder who designs amazing structures',
        unlockCondition: 'complete_bridge_builder_level_1',
        abilities: ['construction_speed', 'material_efficiency'],
      },
      {
        id: 'space_explorer_alex',
        name: 'Space Explorer Alex',
        description: 'Adventurous astronaut exploring the cosmos',
        unlockCondition: 'complete_space_explorer_level_2',
        abilities: ['navigation_boost', 'fuel_efficiency'],
      },
    ],
    levelSystem: {
      maxLevel: 50,
      xpRequirement: [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200],
      rewards: {
        level5: 'new_avatar_unlock',
        level10: 'power_up_slot',
        level15: 'leaderboard_badge',
        level20: 'exclusive_animation',
      },
    },
  },
  collectibles: {
    powerUps: [
      {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: 'Pauses the timer for 30 seconds',
        rarity: 'common',
        effect: 'pause_timer_30s',
        animation: 'blue_sparkle_effect',
      },
      {
        id: 'double_xp',
        name: 'XP Multiplier',
        description: 'Doubles XP gained for this level',
        rarity: 'rare',
        effect: 'xp_multiplier_2x',
        animation: 'golden_glow_effect',
      },
      {
        id: 'hint_crystal',
        name: 'Hint Crystal',
        description: 'Reveals one correct answer',
        rarity: 'uncommon',
        effect: 'reveal_answer',
        animation: 'crystal_shimmer',
      },
    ],
    achievements: [
      {
        id: 'equation_master',
        name: 'Equation Master',
        description: 'Solve 100 equations without mistakes',
        reward: 'exclusive_badge',
        progress: 'track_correct_equations',
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete any level in under 60 seconds',
        reward: 'speed_boost_permanent',
        progress: 'track_completion_time',
      },
    ],
  },
  storyNarrative: {
    mainPlot:
      "The EduQuest Academy is under threat from the Confusion Virus that's scrambling all knowledge across dimensions. Students must master different subjects to collect Knowledge Crystals and restore order to the learning universe.",
    chapterProgression: [
      {
        chapter: 1,
        title: 'The Mathematical Maze Mystery',
        story:
          'The Confusion Virus has turned all equations into maze puzzles. Help restore mathematical order!',
        unlockCondition: 'start_game',
        subjects: ['mathematics'],
      },
      {
        chapter: 2,
        title: 'Chemical Chaos in the Lab',
        story:
          "The school's chemistry lab is in chaos! Reactions are going wrong everywhere. Use your knowledge to fix the formulas!",
        unlockCondition: 'complete_math_chapter',
        subjects: ['science'],
      },
      {
        chapter: 3,
        title: 'Technology Under Attack',
        story:
          'The Virus has infected all computers and circuits! Debug the code and rebuild the systems!',
        unlockCondition: 'complete_science_chapter',
        subjects: ['technology'],
      },
      {
        chapter: 4,
        title: 'Engineering Emergency',
        story: 'Infrastructure is collapsing! Design and build solutions to save the academy!',
        unlockCondition: 'complete_technology_chapter',
        subjects: ['engineering'],
      },
    ],
  },
  leaderboardSystem: {
    categories: [
      {
        type: 'global_xp',
        name: 'Top Scholars',
        description: 'Highest total XP across all subjects',
        resetPeriod: 'never',
      },
      {
        type: 'weekly_champion',
        name: 'Weekly Champions',
        description: 'Most XP gained this week',
        resetPeriod: 'weekly',
      },
      {
        type: 'speed_runner',
        name: 'Speed Masters',
        description: 'Fastest level completion times',
        resetPeriod: 'monthly',
      },
      {
        type: 'subject_master',
        name: 'Subject Specialists',
        description: 'Highest scores in specific subjects',
        resetPeriod: 'never',
      },
    ],
    rewards: {
      rank1: { xp_bonus: 500, exclusive_avatar: true, special_badge: 'golden_crown' },
      rank2: { xp_bonus: 300, special_badge: 'silver_crown' },
      rank3: { xp_bonus: 200, special_badge: 'bronze_crown' },
      top10: { xp_bonus: 100, special_badge: 'top_performer' },
    },
  },
  technicalImplementation: {
    htmlStructure: {
      gameContainer: 'div.game-container',
      animationLayer: 'canvas.animation-layer',
      uiLayer: 'div.ui-overlay',
      particleSystem: 'canvas.particles',
    },
    cssAnimations: {
      transitions: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      keyframes: ['fadeIn', 'slideUp', 'bounce', 'pulse', 'rotate'],
      particleEffects: ['sparkle', 'explosion', 'trail', 'glow'],
    },
    audioSystem: {
      soundLibrary: 'Web Audio API',
      musicTracks: ['background', 'victory', 'defeat', 'ambient'],
      soundEffects: ['click', 'success', 'error', 'notification'],
    },
  },
} as const;

export type EduQuestPlatformConfig = typeof eduQuestPlatform;

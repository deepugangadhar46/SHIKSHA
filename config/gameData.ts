// Auto-generated from user-provided game data spec
// This module exports the full game data and engine configuration
// You can import { gameData, gameEngine } from 'src/config/gameData'

export const gameData = {
  equation_quest: {
    gameInfo: {
      id: 'equation_quest',
      displayName: 'Equation Quest',
      icon: '🧩',
      description: 'Solve equations to unlock maze paths',
      subject: 'mathematics',
      difficulty: 'beginner',
      estimatedTime: '15 min',
    },
    gameAssets: {
      sprites: {
        player: '/assets/games/equation_quest/player_wizard.png',
        maze_wall: '/assets/games/equation_quest/stone_wall.png',
        maze_path: '/assets/games/equation_quest/glowing_path.png',
        locked_path: '/assets/games/equation_quest/blocked_path.png',
        treasure: '/assets/games/equation_quest/math_treasure.png',
      },
      sounds: {
        correct_answer: '/assets/audio/success_chime.mp3',
        wrong_answer: '/assets/audio/error_buzz.mp3',
        path_unlock: '/assets/audio/magical_unlock.mp3',
        level_complete: '/assets/audio/victory_fanfare.mp3',
      },
    },
    levels: [
      {
        levelId: 1,
        name: 'Basic Linear Paths',
        difficulty: 'easy',
        xpReward: 20,
        timeLimit: 300,
        mazeLayout: {
          size: '5x5',
          startPosition: [0, 0],
          endPosition: [4, 4],
          walls: [
            [1, 1],
            [1, 2],
            [2, 1],
            [3, 2],
            [3, 3],
          ],
          equationGates: [
            {
              position: [1, 0],
              equation: 'x + 5 = 10',
              answer: 5,
              unlocks: [
                [1, 0],
                [2, 0],
              ],
            },
            {
              position: [2, 1],
              equation: '2x = 14',
              answer: 7,
              unlocks: [
                [2, 2],
                [2, 3],
              ],
            },
            {
              position: [3, 4],
              equation: 'x - 3 = 7',
              answer: 10,
              unlocks: [[4, 4]],
            },
          ],
        },
        hints: [
          'Remember: What you do to one side, do to the other!',
          'Isolate the variable by moving numbers to the other side',
          'Check your answer by substituting back into the equation',
        ],
        gameplayData: {
          equations: [
            {
              question: 'x + 5 = 10',
              answer: 5,
              steps: ['x = 10 - 5', 'x = 5'],
              explanation: 'Subtract 5 from both sides to isolate x',
            },
            {
              question: '2x = 14',
              answer: 7,
              steps: ['x = 14 ÷ 2', 'x = 7'],
              explanation: 'Divide both sides by 2 to isolate x',
            },
            {
              question: 'x - 3 = 7',
              answer: 10,
              steps: ['x = 7 + 3', 'x = 10'],
              explanation: 'Add 3 to both sides to isolate x',
            },
          ],
        },
      },
      {
        levelId: 2,
        name: 'Multi-step Linear',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 400,
        unlockRequirement: 'equation_quest_level_1',
        mazeLayout: {
          size: '6x6',
          startPosition: [0, 0],
          endPosition: [5, 5],
          walls: [
            [1, 1],
            [1, 2],
            [2, 2],
            [3, 1],
            [4, 3],
            [4, 4],
          ],
          equationGates: [
            {
              position: [2, 0],
              equation: '2x + 3 = 11',
              answer: 4,
              unlocks: [
                [2, 1],
                [3, 0],
              ],
            },
            {
              position: [3, 2],
              equation: '3x - 7 = 8',
              answer: 5,
              unlocks: [
                [3, 3],
                [4, 2],
              ],
            },
            {
              position: [4, 5],
              equation: '4x + 1 = 17',
              answer: 4,
              unlocks: [[5, 5]],
            },
          ],
        },
        gameplayData: {
          equations: [
            {
              question: '2x + 3 = 11',
              answer: 4,
              steps: ['2x = 11 - 3', '2x = 8', 'x = 4'],
              explanation: 'First subtract 3, then divide by 2',
            },
            {
              question: '3x - 7 = 8',
              answer: 5,
              steps: ['3x = 8 + 7', '3x = 15', 'x = 5'],
              explanation: 'First add 7, then divide by 3',
            },
            {
              question: '4x + 1 = 17',
              answer: 4,
              steps: ['4x = 17 - 1', '4x = 16', 'x = 4'],
              explanation: 'First subtract 1, then divide by 4',
            },
          ],
          pictureQuiz: {
            instructions: 'Look at the picture and select the correct equation/answer.',
            questions: [
              {
                image: '/assets/games/equation_quest/pictures/apples_3_plus_2.png',
                prompt: 'How many apples are there?',
                options: ['4', '5', '6', '7'],
                correctIndex: 1,
                explain: 'There are 3 red and 2 green apples. 3 + 2 = 5.'
              },
              {
                image: '/assets/games/equation_quest/pictures/scale_balance.png',
                prompt: 'Which equation balances the scale?',
                options: ['x + 2 = 5', 'x + 3 = 7', '2x = 10', 'x - 2 = 1'],
                correctIndex: 2,
                explain: 'Both sides have weight 5, so 2x = 10 ⇒ x = 5.'
              }
            ]
          }
        },
      },
      // Level 3 will be added below (Adventure)
      ,
      {
        levelId: 3,
        name: 'Temple of Equations',
        difficulty: 'intermediate',
        xpReward: 45,
        timeLimit: 480,
        storyBeats: [
          { id: 'entrance', text: 'You enter an ancient temple. Torches are dark. A stone gate blocks the way.' },
          { id: 'hall', text: 'With a rumble, the gate opens to a hall of glowing runes.' },
          { id: 'sanctum', text: 'The sanctum reveals the Knowledge Crystal as the final torch lights.' }
        ],
        gameplayData: {
          adventure: {
            equation: '2x + 6 = 18',
            steps: [
              {
                id: 'step_subtract',
                prompt: 'First, remove the constant term from the left side.',
                options: ['Add 6 to both sides', 'Subtract 6 from both sides', 'Divide both sides by 2'],
                correctIndex: 1,
                resultEquation: '2x = 12',
                onSuccess: { torchLight: true, gateOpen: false, hint: 'Constant moves by inverse operation.' },
                onFailHint: 'To move +6 to the right, subtract 6 from both sides.'
              },
              {
                id: 'step_divide',
                prompt: 'Now isolate x.',
                options: ['Multiply both sides by 2', 'Divide both sides by 2', 'Square both sides'],
                correctIndex: 1,
                resultEquation: 'x = 6',
                onSuccess: { torchLight: true, gateOpen: true, hint: 'Coefficient goes by division.' },
                onFailHint: 'Undo the multiplication by 2 by dividing both sides by 2.'
              }
            ],
            finale: {
              message: 'You solved it! The Knowledge Crystal hums with energy.',
              rewardIcon: '💎'
            }
          }
        }
      },
      {
        levelId: 4,
        name: 'Quadratic Paths',
        difficulty: 'intermediate',
        xpReward: 50,
        timeLimit: 480,
        mazeLayout: {
          size: '7x7',
          startPosition: [0, 0],
          endPosition: [6, 6],
          walls: [[1,2],[2,2],[3,3],[4,4],[5,4]],
          equationGates: [
            { position: [1,0], equation: 'x^2 - 9 = 0', answer: [3,-3], unlocks: [[1,1],[2,1]] },
            { position: [3,2], equation: 'x^2 - 5x + 6 = 0', answer: [2,3], unlocks: [[3,3],[4,3]] },
            { position: [5,5], equation: 'x^2 + 2x - 8 = 0', answer: [2,-4], unlocks: [[6,6]] }
          ]
        },
        gameplayData: {
          equations: [
            { question: 'x^2 - 9 = 0', answer: 3, steps: ['(x-3)(x+3)=0', 'x=3 or x=-3'], explanation: 'Difference of squares.' },
            { question: 'x^2 - 5x + 6 = 0', answer: 2, steps: ['(x-2)(x-3)=0', 'x=2 or x=3'], explanation: 'Factor the quadratic.' },
            { question: 'x^2 + 2x - 8 = 0', answer: 2, steps: ['(x+4)(x-2)=0', 'x=-4 or x=2'], explanation: 'Find factor pair with sum 2.' }
          ]
        }
      }
      ,
      // --- Appended from user request: additional Equation Quest levels ---
      {
        name: 'The Locked Gate',
        difficulty: 'easy',
        xpReward: 20,
        gameplayData: {
          equations: [
            { question: '2x + 5 = 15', answer: 5 },
            { question: '3x - 4 = 11', answer: 5 },
          ],
        },
      },
      {
        name: 'Torch of Knowledge',
        difficulty: 'easy',
        xpReward: 30,
        gameplayData: {
          adventure: {
            equation: '2x + 3 = 9',
            steps: [
              { prompt: 'Subtract 3 from both sides', options: ['2x = 6', 'x=3'], correctIndex: 0, onSuccess: { torchLight: true } },
              { prompt: 'Divide both sides by 2', options: ['x = 2', 'x = 3'], correctIndex: 1, onSuccess: { gateOpen: true } },
            ],
          },
        },
        storyBeats: [
          { id: 'intro', text: 'You enter the dungeon.' },
          { id: 'torch', text: 'A torch lights up as you solve steps.' },
          { id: 'gate', text: 'The gate opens to treasure!' },
        ],
      },
      {
        name: 'Riddle of Quadratics',
        difficulty: 'medium',
        xpReward: 40,
        gameplayData: {
          equations: [
            { question: 'x² - 5x + 6 = 0', answer: 2 },
            { question: 'x² - 5x + 6 = 0', answer: 3 },
          ],
        },
      },
      {
        name: 'The Bridge Puzzle',
        difficulty: 'medium',
        xpReward: 50,
        gameplayData: {
          adventure: {
            equation: '4x - 12 = 0',
            steps: [
              { prompt: 'Add 12 to both sides', options: ['4x = 12', 'x = 3'], correctIndex: 0, onSuccess: { torchLight: true } },
              { prompt: 'Divide both sides by 4', options: ['x = 2', 'x = 3'], correctIndex: 1, onSuccess: { gateOpen: true } },
            ],
          },
        },
        storyBeats: [
          { id: 'bridge', text: 'You face a broken bridge.' },
          { id: 'fix', text: 'With each step, planks reappear.' },
          { id: 'cross', text: 'The bridge is complete — cross safely!' },
        ],
      },
      {
        name: 'Treasure Chamber Quiz',
        difficulty: 'hard',
        xpReward: 60,
        gameplayData: {
          pictureQuiz: {
            questions: [
              {
                prompt: 'Solve: 5x = 25',
                image: '/assets/equations/chamber1.png',
                options: ['4', '5', '6'],
                correctIndex: 1,
                explain: 'Dividing both sides by 5 gives x = 5.',
              },
              {
                prompt: 'Solve: 2x + 7 = 15',
                image: '/assets/equations/chamber2.png',
                options: ['3', '4', '5'],
                correctIndex: 1,
                explain: 'Subtract 7 then divide by 2: x = 4.',
              },
            ],
          },
        },
      },
      {
        name: 'Quadratic Challenge',
        difficulty: 'hard',
        xpReward: 70,
        gameplayData: {
          equations: [
            { question: 'Solve: x² - 7x + 12 = 0', answer: 3 },
            { question: 'Solve: x² - 7x + 12 = 0', answer: 4 },
          ],
        },
      },
      {
        name: 'Twin Gates Puzzle',
        difficulty: 'hard',
        xpReward: 80,
        gameplayData: {
          equations: [
            { question: 'Solve: 2x + y = 10,  x + y = 6 → x = ?', answer: 4 },
            { question: 'Solve: 2x + y = 10,  x + y = 6 → y = ?', answer: 2 },
          ],
        },
      },
      {
        name: 'The Log Riddle',
        difficulty: 'hard',
        xpReward: 90,
        gameplayData: {
          equations: [
            { question: 'Solve: 2^x = 32', answer: 5 },
            { question: 'Solve: log₂(64) = ?', answer: 6 },
          ],
        },
      },
      {
        name: 'Dungeon of Quadratics',
        difficulty: 'hard',
        xpReward: 100,
        gameplayData: {
          adventure: {
            equation: 'x² - 5x + 6 = 0',
            steps: [
              { prompt: 'Factorize: x² - 5x + 6', options: ['(x-2)(x-3)', '(x-1)(x-6)'], correctIndex: 0, onSuccess: { torchLight: true } },
              { prompt: 'Solve for roots', options: ['x=2 or x=3', 'x=5 or x=6'], correctIndex: 0, onSuccess: { gateOpen: true } },
            ],
          },
        },
        storyBeats: [
          { id: 'intro', text: 'A dark hall with mysterious equations awaits.' },
          { id: 'torch', text: 'Symbols on the wall glow as you solve.' },
          { id: 'gate', text: 'The stone gate slides open!' },
        ],
      }
    ],
  },
  chemistry_lab_simulator: {
    gameInfo: {
      id: 'chemistry_lab_simulator',
      displayName: 'Chemistry Lab Simulator',
      icon: '🧪',
      description: 'Mix chemicals and observe reactions',
      subject: 'science',
      difficulty: 'intermediate',
      estimatedTime: '25 min',
    },
    gameAssets: {
      sprites: {
        lab_bench: '/assets/games/chemistry/lab_bench.png',
        test_tube: '/assets/games/chemistry/test_tube.png',
        beaker: '/assets/games/chemistry/beaker.png',
        periodic_table: '/assets/games/chemistry/periodic_table.png',
      },
      animations: {
        bubble_reaction: '/assets/games/chemistry/animations/bubbles.json',
        color_change: '/assets/games/chemistry/animations/color_change.json',
        fizz_out: '/assets/games/chemistry/animations/safe_fizz.json',
        explosion_safe: '/assets/games/chemistry/animations/safe_pop.json',
      },
      sounds: {
        bubbling: '/assets/audio/chemistry/bubbling.mp3',
        fizz: '/assets/audio/chemistry/fizz.mp3',
        success: '/assets/audio/chemistry/reaction_success.mp3',
        failure: '/assets/audio/chemistry/safe_failure.mp3',
      },
    },
    levels: [
      {
        levelId: 1,
        name: 'Acids and Bases',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 600,
        labEquipment: {
          availableContainers: ['test_tube', 'beaker', 'measuring_cup'],
          availableTools: ['dropper', 'stirrer', 'ph_paper'],
          safetyEquipment: ['goggles', 'gloves', 'apron'],
        },
        chemicals: [
          {
            id: 'HCl',
            name: 'Hydrochloric Acid',
            formula: 'HCl',
            color: 'clear',
            concentration: '0.1M',
            properties: ['acid', 'ph_1'],
            safetyLevel: 'moderate',
            sprite: '/assets/chemistry/chemicals/hcl_bottle.png',
          },
          {
            id: 'NaOH',
            name: 'Sodium Hydroxide',
            formula: 'NaOH',
            color: 'clear',
            concentration: '0.1M',
            properties: ['base', 'ph_13'],
            safetyLevel: 'moderate',
            sprite: '/assets/chemistry/chemicals/naoh_bottle.png',
          },
          {
            id: 'H2O',
            name: 'Water',
            formula: 'H2O',
            color: 'clear',
            concentration: 'pure',
            properties: ['neutral', 'ph_7'],
            safetyLevel: 'safe',
            sprite: '/assets/chemistry/chemicals/water_bottle.png',
          },
        ],
        reactions: [
          {
            id: 'acid_base_neutralization',
            reactants: ['HCl', 'NaOH'],
            products: ['NaCl', 'H2O'],
            equation: 'HCl + NaOH → NaCl + H2O',
            visualEffect: {
              animation: 'gentle_bubbling',
              colorChange: 'clear_to_slightly_cloudy',
              temperature: 'slight_warming',
              sound: 'gentle_fizz',
            },
            isCorrect: true,
            explanation: 'Acid and base neutralize to form salt and water',
            points: 10,
          },
          {
            id: 'water_dilution',
            reactants: ['HCl', 'H2O'],
            products: ['dilute_HCl'],
            equation: 'HCl + H2O → HCl(dilute)',
            visualEffect: {
              animation: 'mixing',
              colorChange: 'no_change',
              temperature: 'no_change',
              sound: 'liquid_mixing',
            },
            isCorrect: true,
            explanation: 'Water dilutes the acid concentration',
            points: 5,
          },
          {
            id: 'wrong_mixture',
            reactants: ['NaOH', 'NaOH'],
            products: ['concentrated_base'],
            visualEffect: {
              animation: 'safe_fizz_out',
              colorChange: 'no_change',
              message: 'Nothing interesting happens - try mixing different chemicals!',
              sound: 'disappointing_fizz',
            },
            isCorrect: false,
            explanation: "Mixing the same chemical doesn't create a reaction",
            points: -2,
          },
        ],
        challenges: [
          {
            challengeId: 1,
            instruction: 'Mix an acid with a base to create a neutralization reaction',
            targetReaction: 'acid_base_neutralization',
            hint: 'Look for chemicals with opposite pH values',
            points: 20,
          },
          {
            challengeId: 2,
            instruction: 'Dilute the acid by adding water',
            targetReaction: 'water_dilution',
            hint: 'Always add acid to water, never water to acid!',
            points: 15,
          },
        ],
        learningObjectives: [
          'Understand acid-base reactions',
          'Learn about pH scale',
          'Practice lab safety',
          'Observe chemical changes',
        ],
      },
      {
        levelId: 2,
        name: 'Indicators and Neutralization',
        difficulty: 'easy',
        xpReward: 40,
        timeLimit: 540,
        labEquipment: {
          availableContainers: ['test_tube', 'beaker', 'measuring_cup'],
          availableTools: ['dropper', 'stirrer', 'ph_paper'],
          safetyEquipment: ['goggles', 'gloves', 'apron']
        },
        chemicals: [
          { id: 'HCl', name: 'Hydrochloric Acid', formula: 'HCl', color: 'clear', concentration: '0.05M', properties: ['acid', 'ph_1'], safetyLevel: 'moderate', sprite: '/assets/chemistry/chemicals/hcl_bottle.png' },
          { id: 'NaOH', name: 'Sodium Hydroxide', formula: 'NaOH', color: 'clear', concentration: '0.05M', properties: ['base', 'ph_13'], safetyLevel: 'moderate', sprite: '/assets/chemistry/chemicals/naoh_bottle.png' },
          { id: 'H2O', name: 'Water', formula: 'H2O', color: 'clear', concentration: 'pure', properties: ['neutral', 'ph_7'], safetyLevel: 'safe', sprite: '/assets/chemistry/chemicals/water_bottle.png' }
        ],
        reactions: [
          {
            id: 'acid_base_neutralization',
            reactants: ['HCl', 'NaOH'],
            products: ['NaCl', 'H2O'],
            equation: 'HCl + NaOH → NaCl + H2O',
            visualEffect: { animation: 'gentle_bubbling', colorChange: 'clear_to_slightly_cloudy', temperature: 'slight_warming', sound: 'gentle_fizz' },
            isCorrect: true,
            explanation: 'Acid and base neutralize to form salt and water',
            points: 15
          },
          {
            id: 'water_dilution',
            reactants: ['HCl', 'H2O'],
            products: ['dilute_HCl'],
            equation: 'HCl + H2O → HCl(dilute)',
            visualEffect: { animation: 'mixing', colorChange: 'no_change', temperature: 'no_change', sound: 'liquid_mixing' },
            isCorrect: true,
            explanation: 'Diluting acid reduces its concentration and raises pH toward neutral',
            points: 8
          }
        ],
        challenges: [
          { challengeId: 1, instruction: 'Dilute the acid by adding water to the beaker', targetReaction: 'water_dilution', hint: 'Pour HCl, then H2O into beaker', points: 15 },
          { challengeId: 2, instruction: 'Add base to neutralize the solution', targetReaction: 'acid_base_neutralization', hint: 'Add NaOH to the acid solution', points: 25 }
        ],
        learningObjectives: [
          'Use indicators to observe pH change',
          'Understand dilution and its effect on pH',
          'Perform acid-base neutralization step by step'
        ]
      }
    ],
  },
  // -----------------------
  // Coding Maze (tech)
  // -----------------------
  coding_maze: {
    gameInfo: {
      id: 'coding_maze',
      displayName: 'Coding Maze',
      description: 'Write logic and loops to guide a robot out of a maze.',
      icon: '🤖',
      subject: 'technology',
      difficulty: 'intermediate',
      estimatedTime: '15 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'Basic Moves',
        difficulty: 'easy',
        xpReward: 30,
        objective: 'Reach the exit with simple forward/turn commands',
        maze: {
          size: '5x5',
          walls: [[1,1],[2,2],[3,1]],
          start: [0,0],
          exit: [4,4],
        },
        allowedCommands: ['forward', 'left', 'right'],
      },
      {
        levelId: 2,
        name: 'Loops & Patterns',
        difficulty: 'medium',
        xpReward: 45,
        objective: 'Use loops to minimize command length',
        maze: {
          size: '6x6',
          walls: [[1,2],[2,2],[3,3],[4,2]],
          start: [0,0],
          exit: [5,5],
        },
        allowedCommands: ['forward', 'left', 'right', 'repeat'],
      },
    ],
  },

  // -----------------------
  // 5. Science Quiz
  // -----------------------
  science_quiz: {
    gameInfo: {
      id: 'science_quiz',
      displayName: 'Science Quiz',
      description: 'Test your knowledge of physics, chemistry and biology with fun questions!',
      icon: '🔬',
      subject: 'science',
      difficulty: 'beginner',
      estimatedTime: '12 min',
    },
    levels: [
      {
        name: 'Physics Basics',
        difficulty: 'easy',
        xpReward: 25,
        gameplayData: {
          pictureQuiz: {
            questions: [
              {
                prompt: 'What is the SI unit of Force?',
                image: '/assets/science/force.png',
                options: ['Newton', 'Joule', 'Watt'],
                correctIndex: 0,
                explain: 'Force is measured in Newtons (N).',
              },
              {
                prompt: "Which law explains action and reaction?",
                image: '/assets/science/newton3.png',
                options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law"],
                correctIndex: 2,
                explain: "Newton's 3rd law: Every action has an equal and opposite reaction.",
              },
            ],
          },
        },
      },
      {
        name: 'Chemistry Mix',
        difficulty: 'medium',
        xpReward: 35,
        gameplayData: {
          pictureQuiz: {
            questions: [
              {
                prompt: 'pH less than 7 means the solution is…?',
                image: '/assets/science/ph.png',
                options: ['Acidic', 'Basic', 'Neutral'],
                correctIndex: 0,
                explain: 'pH < 7 → acidic solution.',
              },
              {
                prompt: 'Which gas is produced when metals react with acids?',
                image: '/assets/science/hydrogen.png',
                options: ['Oxygen', 'Hydrogen', 'Carbon Dioxide'],
                correctIndex: 1,
                explain: 'Metals + Acids → Salt + Hydrogen gas.',
              },
            ],
          },
        },
      },
      {
        name: 'Biology Wonders',
        difficulty: 'medium',
        xpReward: 40,
        gameplayData: {
          pictureQuiz: {
            questions: [
              {
                prompt: 'Which organelle is called the powerhouse of the cell?',
                image: '/assets/science/mitochondria.png',
                options: ['Mitochondria', 'Nucleus', 'Ribosome'],
                correctIndex: 0,
                explain: 'Mitochondria generate energy in the form of ATP.',
              },
              {
                prompt: 'Which blood cells help fight infection?',
                image: '/assets/science/wbc.png',
                options: ['Red Blood Cells', 'White Blood Cells', 'Platelets'],
                correctIndex: 1,
                explain: 'WBCs are part of the immune system.',
              },
            ],
          },
        },
      },
      {
        name: 'Mixed Science Challenge',
        difficulty: 'hard',
        xpReward: 60,
        gameplayData: {
          pictureQuiz: {
            questions: [
              {
                prompt: 'Speed of light in vacuum is approximately…?',
                image: '/assets/science/light.png',
                options: ['3 × 10^5 m/s', '3 × 10^8 m/s', '3 × 10^6 m/s'],
                correctIndex: 1,
                explain: 'The speed of light is 3 × 10^8 m/s.',
              },
              {
                prompt: "Which element has the chemical symbol 'Fe'?",
                image: '/assets/science/iron.png',
                options: ['Fluorine', 'Iron', 'Francium'],
                correctIndex: 1,
                explain: "'Fe' comes from the Latin word 'Ferrum' for Iron.",
              },
              {
                prompt: 'Which part of the brain controls balance?',
                image: '/assets/science/brain.png',
                options: ['Cerebellum', 'Cerebrum', 'Medulla'],
                correctIndex: 0,
                explain: 'The cerebellum maintains posture and balance.',
              },
            ],
          },
        },
      },
    ],
  },
  circuit_builder: {
    gameInfo: {
      id: 'circuit_builder',
      displayName: 'Circuit Builder',
      icon: '🔌',
      description: 'Build electrical circuits to light up bulbs',
      subject: 'technology',
      difficulty: 'intermediate',
      estimatedTime: '25 min',
    },
    gameAssets: {
      components: {
        battery: {
          sprite: '/assets/games/circuits/battery.png',
          voltage: 9,
          properties: ['power_source'],
          connections: ['positive', 'negative'],
        },
        led: {
          sprite: '/assets/games/circuits/led.png',
          voltage_requirement: 2,
          properties: ['light_emitter'],
          connections: ['anode', 'cathode'],
          colors: ['red', 'green', 'blue', 'yellow'],
        },
        resistor: {
          sprite: '/assets/games/circuits/resistor.png',
          resistance_values: [100, 220, 330, 470, 1000],
          properties: ['current_limiter'],
          connections: ['terminal1', 'terminal2'],
        },
        wire: {
          sprite: '/assets/games/circuits/wire.png',
          properties: ['conductor'],
          bendable: true,
        },
        switch: {
          sprite: '/assets/games/circuits/switch.png',
          states: ['open', 'closed'],
          properties: ['controller'],
          connections: ['input', 'output'],
        },
      },
      sounds: {
        connection_made: '/assets/audio/circuits/click.mp3',
        circuit_complete: '/assets/audio/circuits/power_on.mp3',
        led_light: '/assets/audio/circuits/led_on.mp3',
        short_circuit: '/assets/audio/circuits/warning_beep.mp3',
      },
    },
    levels: [
      {
        levelId: 1,
        name: 'Simple Circuits',
        difficulty: 'easy',
        xpReward: 30,
        timeLimit: 600,
        objective: 'Light up the LED using a battery and wires',
        availableComponents: {
          battery: 1,
          led: 1,
          wire: 5,
          switch: 1,
        },
        circuitChallenges: [
          {
            challengeId: 1,
            title: 'Basic LED Circuit',
            description: 'Connect a battery to an LED to make it light up',
            targetCircuit: {
              components: ['battery', 'led', 'wire'],
              connections: [
                { from: 'battery.positive', to: 'led.anode', via: 'wire' },
                { from: 'led.cathode', to: 'battery.negative', via: 'wire' },
              ],
            },
            hints: [
              'LEDs have polarity - connect positive to anode, negative to cathode',
              'Current flows from positive to negative',
              'Make sure to complete the circuit loop',
            ],
            validation: {
              requiredConnections: 2,
              mustLightUp: ['led'],
              noShortCircuits: true,
            },
            points: 25,
          },
          {
            challengeId: 2,
            title: 'Switchable LED',
            description: 'Add a switch to control the LED',
            targetCircuit: {
              components: ['battery', 'led', 'switch', 'wire'],
              connections: [
                { from: 'battery.positive', to: 'switch.input', via: 'wire' },
                { from: 'switch.output', to: 'led.anode', via: 'wire' },
                { from: 'led.cathode', to: 'battery.negative', via: 'wire' },
              ],
            },
            validation: {
              switchControlsLED: true,
              ledOffWhenSwitchOpen: true,
              ledOnWhenSwitchClosed: true,
            },
            points: 35,
          },
        ],
        electricalConcepts: [
          {
            concept: 'current_flow',
            explanation: 'Electric current flows from positive to negative terminal',
            visual: '/assets/concepts/current_flow_animation.gif',
          },
          {
            concept: 'complete_circuit',
            explanation: 'A complete loop is needed for current to flow',
            visual: '/assets/concepts/circuit_loop.gif',
          },
          {
            concept: 'led_polarity',
            explanation: 'LEDs only work when connected in the correct direction',
            visual: '/assets/concepts/led_polarity.png',
          },
        ],
      },
      {
        levelId: 2,
        name: 'Dual LED with Resistor',
        difficulty: 'intermediate',
        xpReward: 45,
        timeLimit: 600,
        objective: 'Power two LEDs safely using appropriate resistors',
        availableComponents: {
          battery: 1,
          led: 2,
          resistor: 3,
          wire: 8,
          switch: 1,
        },
        circuitChallenges: [
          {
            challengeId: 1,
            title: 'Two LEDs in Series',
            description: 'Design a circuit to light two LEDs using resistors to limit current',
            targetCircuit: {
              components: ['battery', 'led', 'led', 'resistor', 'wire'],
              connections: [
                { from: 'battery.positive', to: 'resistor.terminal1', via: 'wire' },
                { from: 'resistor.terminal2', to: 'led.anode', via: 'wire' },
                { from: 'led.cathode', to: 'led.anode', via: 'wire' },
                { from: 'led.cathode', to: 'battery.negative', via: 'wire' },
              ],
            },
            validation: {
              mustLightUp: ['led'],
              noShortCircuits: true,
            },
            points: 30,
          },
          {
            challengeId: 2,
            title: 'Switchable Dual LED (Parallel)',
            description: 'Use a switch to control two LEDs in parallel',
            targetCircuit: {
              components: ['battery', 'switch', 'led', 'led', 'resistor', 'resistor', 'wire'],
              connections: [
                { from: 'battery.positive', to: 'switch.input', via: 'wire' },
                { from: 'switch.output', to: 'led.anode', via: 'wire' },
                { from: 'switch.output', to: 'led.anode', via: 'wire' },
                { from: 'led.cathode', to: 'resistor.terminal1', via: 'wire' },
                { from: 'resistor.terminal2', to: 'battery.negative', via: 'wire' },
              ],
            },
            validation: {
              switchControlsLED: true,
              ledOnWhenSwitchClosed: true,
            },
            points: 40,
          },
        ],
        electricalConcepts: [
          { concept: 'series_vs_parallel', explanation: 'Series share current, parallel share voltage', visual: '/assets/concepts/series_parallel.png' },
        ],
      }
    ],
  },
  bridge_builder: {
    gameInfo: {
      id: 'bridge_builder',
      displayName: 'Bridge Builder',
      icon: '🌉',
      description: 'Design bridges that can withstand heavy loads',
      subject: 'engineering',
      difficulty: 'advanced',
      estimatedTime: '30 min',
    },
    gameAssets: {
      materials: {
        wood_beam: {
          sprite: '/assets/games/bridge/wood_beam.png',
          strength: 1000,
          cost: 10,
          weight: 5,
          length_options: [1, 2, 3, 4],
          properties: ['lightweight', 'flexible'],
        },
        steel_beam: {
          sprite: '/assets/games/bridge/steel_beam.png',
          strength: 5000,
          cost: 50,
          weight: 20,
          length_options: [1, 2, 3, 4, 5],
          properties: ['strong', 'heavy'],
        },
        cable: {
          sprite: '/assets/games/bridge/cable.png',
          tension_strength: 8000,
          cost: 30,
          weight: 2,
          properties: ['flexible', 'tension_only'],
        },
        support_pillar: {
          sprite: '/assets/games/bridge/pillar.png',
          compression_strength: 10000,
          cost: 100,
          weight: 50,
          properties: ['compression_only', 'foundation_required'],
        },
      },
      physics: {
        gravity: 9.8,
        safety_factor: 2.0,
        load_test_vehicles: [
          { name: 'bicycle', weight: 100, sprite: '/assets/games/bridge/bicycle.png' },
          { name: 'car', weight: 1500, sprite: '/assets/games/bridge/car.png' },
          { name: 'truck', weight: 8000, sprite: '/assets/games/bridge/truck.png' },
        ],
      },
      sounds: {
        construction: '/assets/audio/bridge/hammer.mp3',
        load_test: '/assets/audio/bridge/vehicle_crossing.mp3',
        success: '/assets/audio/bridge/success_horn.mp3',
        collapse: '/assets/audio/bridge/collapse.mp3',
        creaking: '/assets/audio/bridge/wood_stress.mp3',
      },
    },
    levels: [
      {
        levelId: 1,
        name: 'Simple Beam Bridge',
        difficulty: 'easy',
        xpReward: 35,
        timeLimit: 600,
        scenario: {
          span_length: 10,
          required_load: 1000,
          budget: 500,
          terrain: 'flat_ground',
          environmental_factors: [],
        },
        challenges: [
          {
            challengeId: 1,
            title: 'Cross the Gap',
            description: 'Build a simple bridge that can support a car crossing',
            requirements: {
              min_load_capacity: 1000,
              max_cost: 500,
              span_distance: 10,
              vehicle_clearance: 2,
            },
            test_vehicles: ['bicycle', 'car'],
            success_criteria: {
              all_vehicles_cross: true,
              no_structural_failure: true,
              within_budget: true,
              deflection_limit: 1.0,
            },
            hints: [
              'A simple beam bridge uses horizontal supports',
              'Consider the weight distribution across the span',
              'Check that your materials can handle the load',
            ],
            physics_simulation: {
              load_points: [
                { position: 2, max_load: 250 },
                { position: 5, max_load: 500 },
                { position: 8, max_load: 250 },
              ],
              support_points: [
                { position: 0, type: 'fixed' },
                { position: 10, type: 'roller' },
              ],
              failure_modes: ['beam_buckling', 'support_failure', 'excessive_deflection'],
            },
          },
        ],
        engineering_concepts: [
          {
            concept: 'beam_loading',
            explanation: 'Beams carry loads through bending',
            formula: 'M = F × L / 4 (for center loading)',
            visual: '/assets/concepts/beam_bending.gif',
          },
          {
            concept: 'material_strength',
            explanation: 'Different materials have different load capacities',
            comparison_table: {
              wood: { strength: 1000, cost: 10, weight: 5 },
              steel: { strength: 5000, cost: 50, weight: 20 },
            },
          },
        ],
      },
      // --- Appended from user request: additional Circuit Builder levels ---
      {
        name: 'Light the Bulb',
        difficulty: 'easy',
        xpReward: 30,
        circuitChallenges: [
          { challengeId: 'c1' as any, title: 'Light the Bulb', description: 'Connect a battery and a bulb with wires.', targetCircuit: undefined, hints: [], points: 20 },
        ],
      },
      {
        name: 'Series vs Parallel',
        difficulty: 'medium',
        xpReward: 40,
        circuitChallenges: [
          { challengeId: 'c2' as any, title: 'Series vs Parallel', description: 'Make 2 bulbs glow with one battery using parallel connection.', targetCircuit: undefined, hints: [], points: 30 },
        ],
      }
    ],
  },
  advanced_mathematics_levels: {
    calculus_explorer: {
      title: 'Calculus Explorer',
      icon: '∫',
      grade_level: '10+',
      subject: 'advanced_mathematics',
      levels: {
        derivatives_basic: {
          name: 'Derivative Fundamentals',
          unlock_requirement: 'complete_algebra_systems',
          problems: [
            { equation: 'f(x) = 3x⁴ - 2x³ + 5x - 7', find: "f'(x)", solution: '12x³ - 6x² + 5', points: 40 },
            { equation: 'g(x) = sin(2x) + cos(x²)', find: "g'(x)", solution: '2cos(2x) - 2x·sin(x²)', points: 45 },
            { equation: 'h(x) = e^(3x) · ln(x)', find: "h'(x)", solution: '3e^(3x)·ln(x) + e^(3x)/x', points: 50 },
          ],
        },
        integration_techniques: {
          name: 'Integration Mastery',
          unlock_requirement: 'complete_derivatives_basic',
          problems: [
            { integral: '∫(2x³ + 5x² - 3x + 1)dx', solution: 'x⁴/2 + 5x³/3 - 3x²/2 + x + C', points: 45 },
            { integral: '∫x·e^(x²)dx', method: 'substitution', solution: 'e^(x²)/2 + C', points: 50 },
            { integral: '∫x·cos(x)dx', method: 'integration_by_parts', solution: 'x·sin(x) + cos(x) + C', points: 55 },
          ],
        },
        limits_continuity: {
          name: 'Limits & Continuity',
          unlock_requirement: 'complete_integration_techniques',
          problems: [
            { limit: 'lim(x→0) [sin(3x)/x]', solution: '3', method: "L'Hopital", points: 50 },
            { limit: 'lim(x→∞) [(2x² + 3x - 1)/(x² - 5)]', solution: '2', method: 'dominant_terms', points: 55 },
            { continuity: 'f(x) = {x² if x<2; ax+b if x≥2}', find: 'a,b for continuity', solution: 'a=4, b=-4', points: 60 },
          ],
        },
        differential_equations: {
          name: 'Differential Equations',
          unlock_requirement: 'complete_limits_continuity',
          problems: [
            { equation: 'dy/dx = 3y', type: 'separable', solution: 'y = Ce^(3x)', points: 55 },
            { equation: 'dy/dx + 2y = 4e^x', type: 'first_order_linear', solution: 'y = Ce^(-2x) + (4/3)e^x', points: 60 },
            { equation: 'd²y/dx² - 4dy/dx + 4y = 0', type: 'second_order_homogeneous', solution: 'y = (C₁ + C₂x)e^(2x)', points: 65 },
          ],
        },
        multivariable_calculus: {
          name: 'Multivariable Functions',
          unlock_requirement: 'complete_differential_equations',
          problems: [
            { function: 'f(x,y) = x³y² - 2xy + y³', find: '∂f/∂x', solution: '3x²y² - 2y', points: 60 },
            { function: 'f(x,y) = e^(xy) + sin(x²y)', find: '∂f/∂y', solution: 'xe^(xy) + x²cos(x²y)', points: 65 },
            { optimization: 'Find critical points of f(x,y) = x² + y² - 2x + 4y', solution: '(1, -2) minimum', points: 70 },
          ],
        },
      },
    },
  },
  advanced_biology_levels: {
    molecular_genetics_lab: {
      title: 'Molecular Genetics Lab',
      icon: '🧬',
      grade_level: '10+',
      subject: 'advanced_biology',
      levels: {
        gene_expression: {
          name: 'Gene Expression Control',
          unlock_requirement: 'complete_dna_code_breaker_all',
          experiments: [
            { scenario: 'lac_operon_regulation', condition: 'glucose_absent_lactose_present', prediction: 'gene_transcription_on', mechanism: 'CAP_cAMP_binding', points: 40 },
            { scenario: 'trp_operon_regulation', condition: 'tryptophan_abundant', prediction: 'gene_transcription_off', mechanism: 'attenuation_termination', points: 45 },
            { scenario: 'eukaryotic_enhancers', factors: ['transcription_factors', 'chromatin_remodeling', 'DNA_methylation'], outcome: 'tissue_specific_expression', points: 50 },
          ],
        },
        protein_synthesis: {
          name: 'Advanced Protein Synthesis',
          unlock_requirement: 'complete_gene_expression',
          processes: [
            { step: 'mRNA_processing', events: ["5'_capping", "3'_polyadenylation", 'splicing'], introns_removed: 3, exons_joined: 4, points: 45 },
            { step: 'translation_regulation', mechanism: 'ribosome_binding_site_accessibility', factors: ['secondary_structure', 'binding_proteins', 'small_RNAs'], points: 50 },
            { step: 'post_translational_modification', modifications: ['phosphorylation', 'glycosylation', 'ubiquitination'], functional_outcome: 'protein_activity_regulation', points: 55 },
          ],
        },
        cellular_metabolism: {
          name: 'Metabolic Pathways',
          unlock_requirement: 'complete_protein_synthesis',
          pathways: [
            { pathway: 'glycolysis_regulation', key_enzymes: ['phosphofructokinase', 'pyruvate_kinase'], allosteric_regulators: ['ATP_inhibition', 'AMP_activation'], net_ATP: 2, points: 50 },
            { pathway: 'citric_acid_cycle', regulation_points: ['citrate_synthase', 'isocitrate_dehydrogenase', 'alpha_ketoglutarate_dehydrogenase'], cofactors: ['NAD+', 'FAD', 'CoA'], net_products: '3_NADH_1_FADH2_1_GTP', points: 55 },
            { pathway: 'electron_transport_chain', complexes: ['Complex_I', 'Complex_III', 'Complex_IV'], proton_pumping: '10_H+_per_NADH', ATP_synthesis: 'chemiosmotic_coupling', points: 60 },
          ],
        },
        molecular_evolution: {
          name: 'Evolution at Molecular Level',
          unlock_requirement: 'complete_cellular_metabolism',
          concepts: [
            { mechanism: 'neutral_evolution', example: 'synonymous_mutations', calculation: 'molecular_clock_rate', species_comparison: 'human_chimp_divergence_6MYA', points: 55 },
            { mechanism: 'positive_selection', example: 'adaptive_immunity_genes', measurement: 'dN_dS_ratio_greater_than_1', functional_significance: 'pathogen_resistance', points: 60 },
            { mechanism: 'horizontal_gene_transfer', example: 'antibiotic_resistance_plasmids', detection: 'phylogenetic_incongruence', evolutionary_impact: 'rapid_adaptation', points: 65 },
          ],
        },
        systems_biology: {
          name: 'Biological Networks',
          unlock_requirement: 'complete_molecular_evolution',
          networks: [
            { network_type: 'gene_regulatory_network', components: ['transcription_factors', 'target_genes', 'regulatory_sequences'], dynamics: 'feedback_loops', emergent_property: 'bistability', points: 60 },
            { network_type: 'protein_interaction_network', analysis: 'centrality_measures', hub_proteins: 'essential_for_viability', disease_relevance: 'cancer_driver_mutations', points: 65 },
            { network_type: 'metabolic_network', constraint: 'flux_balance_analysis', optimization: 'biomass_production', applications: 'drug_target_identification', points: 70 },
          ],
        },
      },
    },
  },
  advanced_technology_levels: {
    quantum_computing_lab: {
      title: 'Quantum Computing Lab',
      icon: '⚛️',
      grade_level: '10+',
      subject: 'advanced_technology',
      levels: {
        quantum_bits: {
          name: 'Quantum Bit Fundamentals',
          unlock_requirement: 'complete_ai_challenge_all',
          concepts: [
            { qubit_state: '|0⟩ and |1⟩', superposition: 'α|0⟩ + β|1⟩', measurement_probability: '|α|² and |β|²', example: 'Hadamard_gate_creates_equal_superposition', points: 40 },
            { entanglement: 'Bell_states', example: '(|00⟩ + |11⟩)/√2', property: 'measurement_correlation', application: 'quantum_teleportation', points: 45 },
            { quantum_gates: ['Pauli_X', 'Pauli_Y', 'Pauli_Z', 'Hadamard', 'CNOT'], circuit_design: 'quantum_algorithm_implementation', reversibility: 'unitary_operations_only', points: 50 },
          ],
        },
        quantum_algorithms: {
          name: 'Quantum Algorithm Design',
          unlock_requirement: 'complete_quantum_bits',
          algorithms: [
            { algorithm: 'Deutsch_Jozsa', problem: 'determine_if_function_constant_or_balanced', quantum_advantage: 'single_query_vs_exponential_classical', implementation: 'oracle_plus_Hadamard_transforms', points: 45 },
            { algorithm: 'Grover_search', problem: 'search_unsorted_database', speedup: 'quadratic_improvement', iterations: 'π√N/4', amplitude_amplification: 'rotate_towards_target', points: 50 },
            { algorithm: 'Shor_factoring', problem: 'factor_large_integers', key_insight: 'period_finding_using_QFT', cryptographic_impact: 'RSA_vulnerability', points: 55 },
          ],
        },
        machine_learning_advanced: {
          name: 'Neural Networks & Deep Learning',
          unlock_requirement: 'complete_quantum_algorithms',
          architectures: [
            { type: 'convolutional_neural_network', layers: ['conv2d', 'maxpool', 'dropout', 'dense'], application: 'image_classification', backpropagation: 'gradient_descent_optimization', regularization: 'batch_normalization', points: 50 },
            { type: 'recurrent_neural_network', variant: 'LSTM_long_short_term_memory', application: 'sequence_prediction', gates: ['forget', 'input', 'output'], vanishing_gradient_solution: 'gated_architecture', points: 55 },
            { type: 'transformer_architecture', mechanism: 'self_attention', components: ['multi_head_attention', 'position_encoding', 'feed_forward'], application: 'natural_language_processing', breakthrough: 'GPT_and_BERT_models', points: 60 },
          ],
        },
        cybersecurity_advanced: {
          name: 'Advanced Cybersecurity',
          unlock_requirement: 'complete_machine_learning_advanced',
          topics: [
            { concept: 'public_key_cryptography', algorithm: 'RSA_encryption', key_generation: 'large_prime_multiplication', security: 'factoring_hardness_assumption', key_exchange: 'Diffie_Hellman_protocol', points: 55 },
            { concept: 'blockchain_technology', consensus: 'proof_of_work', hash_function: 'SHA256', immutability: 'cryptographic_chain_integrity', smart_contracts: 'decentralized_execution', points: 60 },
            { concept: 'zero_knowledge_proofs', property: 'prove_knowledge_without_revealing', example: 'zk_SNARKs', application: 'privacy_preserving_authentication', verification: 'polynomial_commitment_schemes', points: 65 },
          ],
        },
        distributed_systems: {
          name: 'Distributed Computing',
          unlock_requirement: 'complete_cybersecurity_advanced',
          systems: [
            { concept: 'consensus_algorithms', problem: 'Byzantine_fault_tolerance', solutions: ['PBFT', 'Raft', 'Paxos'], trade_offs: 'CAP_theorem', consistency_availability_partition_tolerance: 'choose_two', points: 60 },
            { concept: 'microservices_architecture', communication: 'REST_APIs_message_queues', service_discovery: 'dynamic_registration', fault_tolerance: 'circuit_breaker_pattern', scalability: 'horizontal_scaling', points: 65 },
            { concept: 'edge_computing', latency_optimization: 'computation_near_data_source', '5G_integration': 'ultra_low_latency_applications', IoT_processing: 'real_time_analytics', challenges: 'resource_constraints_connectivity', points: 70 },
          ],
        },
      },
    },
  },
  progression_requirements: {
    grade_10_plus_unlock: {
      mathematics: 'complete_all_basic_math_games_with_80_percent_accuracy',
      biology: 'complete_dna_code_breaker_and_chemistry_lab_simulator',
      technology: 'complete_ai_challenge_and_coding_maze_advanced_levels',
    },
    difficulty_scaling: {
      points_range: '40_to_70_based_on_complexity',
      time_limits: 'increased_for_complex_problems',
      hint_system: 'reduced_hints_for_advanced_levels',
      prerequisite_knowledge: 'assumes_solid_foundation_in_basics',
    },
  },
  calculus_explorer: {
    gameInfo: {
      id: 'calculus_explorer',
      displayName: 'Calculus Explorer',
      icon: '∫',
      description: 'Explore calculus concepts in an interactive Unity experience',
      subject: 'mathematics',
      difficulty: 'advanced',
      estimatedTime: '20 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'WebGL Experience',
        difficulty: 'advanced',
        xpReward: 60,
        timeLimit: 900,
        unityWebGL: {
          loaderUrl: '/unity/calculus-explorer/Build/build.loader.js',
          dataUrl: '/unity/calculus-explorer/Build/build.data',
          frameworkUrl: '/unity/calculus-explorer/Build/build.framework.js',
          codeUrl: '/unity/calculus-explorer/Build/build.wasm',
          productName: 'CalculusExplorer',
          productVersion: '1.0.0'
        }
      }
    ]
  },
  molecular_playground_3d: {
    gameInfo: {
      id: 'molecular_playground_3d',
      displayName: 'Molecular Playground 3D',
      icon: '⚗️',
      description: '3D molecular construction and interaction simulator',
      subject: 'science',
      difficulty: 'advanced',
      estimatedTime: '20 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'WebGL Experience',
        difficulty: 'advanced',
        xpReward: 60,
        timeLimit: 900,
        unityWebGL: {
          loaderUrl: '/unity/molecular-playground-3d/Build/build.loader.js',
          dataUrl: '/unity/molecular-playground-3d/Build/build.data',
          frameworkUrl: '/unity/molecular-playground-3d/Build/build.framework.js',
          codeUrl: '/unity/molecular-playground-3d/Build/build.wasm',
          productName: 'MolecularPlayground3D',
          productVersion: '1.0.0'
        }
      }
    ]
  },
  calculus_world_3d: {
    gameInfo: {
      id: 'calculus_world_3d',
      displayName: 'Calculus World 3D',
      icon: '📈',
      description: 'Interactive 3D mathematical function visualization and manipulation',
      subject: 'mathematics',
      difficulty: 'advanced',
      estimatedTime: '20 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'WebGL Experience',
        difficulty: 'advanced',
        xpReward: 60,
        timeLimit: 900,
        unityWebGL: {
          loaderUrl: '/unity/calculus-world-3d/Build/build.loader.js',
          dataUrl: '/unity/calculus-world-3d/Build/build.data',
          frameworkUrl: '/unity/calculus-world-3d/Build/build.framework.js',
          codeUrl: '/unity/calculus-world-3d/Build/build.wasm',
          productName: 'CalculusWorld3D',
          productVersion: '1.0.0'
        }
      }
    ]
  },
  cyber_defense_simulator: {
    gameInfo: {
      id: 'cyber_defense_simulator',
      displayName: 'Cyber Defense Simulator',
      icon: '🛡️',
      description: '3D network security simulation with real-time threat visualization',
      subject: 'technology',
      difficulty: 'advanced',
      estimatedTime: '25 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'WebGL Experience',
        difficulty: 'advanced',
        xpReward: 65,
        timeLimit: 1200,
        unityWebGL: {
          loaderUrl: '/unity/cyber-defense-simulator/Build/build.loader.js',
          dataUrl: '/unity/cyber-defense-simulator/Build/build.data',
          frameworkUrl: '/unity/cyber-defense-simulator/Build/build.framework.js',
          codeUrl: '/unity/cyber-defense-simulator/Build/build.wasm',
          productName: 'CyberDefenseSimulator',
          productVersion: '1.0.0'
        }
      }
    ]
  },
  structural_engineer_vr: {
    gameInfo: {
      id: 'structural_engineer_vr',
      displayName: 'Structural Engineer VR',
      icon: '🏗️',
      description: 'Virtual reality structural engineering with realistic physics simulation',
      subject: 'engineering',
      difficulty: 'advanced',
      estimatedTime: '25 min',
    },
    levels: [
      {
        levelId: 1,
        name: 'WebGL Experience',
        difficulty: 'advanced',
        xpReward: 65,
        timeLimit: 1200,
        unityWebGL: {
          loaderUrl: '/unity/structural-engineer-vr/Build/build.loader.js',
          dataUrl: '/unity/structural-engineer-vr/Build/build.data',
          frameworkUrl: '/unity/structural-engineer-vr/Build/build.framework.js',
          codeUrl: '/unity/structural-engineer-vr/Build/build.wasm',
          productName: 'StructuralEngineerVR',
          productVersion: '1.0.0'
        }
      }
    ]
  },
} as const;

export const gameEngine = {
  commonSystems: {
    progressTracking: {
      playerProgress: {
        currentLevel: 1,
        xpTotal: 0,
        gamesCompleted: [] as string[],
        levelsCompleted: [] as string[],
        badges: [] as string[],
        streakCount: 0,
        lastPlayedDate: null as string | null,
      },
      levelUnlockSystem: {
        checkUnlockCondition: 'function(gameId, levelId, playerProgress)',
        unlockLevel: 'function(gameId, levelId)',
        lockLevel: 'function(gameId, levelId)',
      },
    },
    saveSystem: {
      localStorage: false,
      sessionStorage: false,
      inMemoryStorage: true,
      syncToServer: true,
      offlineStorage: {
        enabled: true,
        maxStorageSize: '50MB',
        syncOnReconnect: true,
      },
    },
    audioSystem: {
      backgroundMusic: {
        enabled: true,
        volume: 0.3,
        tracks: [
          '/assets/audio/background/learning_ambient.mp3',
          '/assets/audio/background/focus_music.mp3',
        ],
      },
      soundEffects: {
        enabled: true,
        volume: 0.7,
        categories: ['ui', 'gameplay', 'feedback', 'ambient'],
      },
    },
    inputSystem: {
      supportedInputs: ['mouse', 'touch', 'keyboard'],
      accessibility: {
        keyboardNavigation: true,
        highContrast: true,
        largeText: true,
      },
    },
  },
  renderEngine: {
    canvas: {
      renderer: 'HTML5_Canvas',
      resolution: '1920x1080',
      scalingMode: 'responsive',
      backgroundColor: '#1a1a1a',
    },
    sprites: {
      loadingStrategy: 'progressive',
      compression: 'webp',
      fallback: 'png',
      spriteSheets: true,
    },
    animations: {
      framework: 'custom',
      interpolation: 'linear',
      frameRate: 60,
    },
  },
} as const;

export type GameData = typeof gameData;
export type GameEngineConfig = typeof gameEngine;

// Mathematics Drag & Drop Game Scene
// Interactive algebra and arithmetic problems for Classes 6-12
// Integrates with Odisha government curriculum

export class MathDragDropScene extends Phaser.Scene {
  private gameData: any;
  private dragItems: Phaser.GameObjects.Container[] = [];
  private dropZones: Phaser.GameObjects.Zone[] = [];
  private currentProblem: any;
  private score: number = 0;
  private problemsCompleted: number = 0;
  private totalProblems: number = 5;
  private timeLeft: number = 300; // 5 minutes
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private problemText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private hintButton!: Phaser.GameObjects.Container;
  private nextButton!: Phaser.GameObjects.Container;
  private hintsUsed: number = 0;
  private mistakes: number = 0;

  constructor() {
    super({ key: 'MathDragDropScene' });
  }

  init(data: any) {
    this.gameData = data;
    this.score = 0;
    this.problemsCompleted = 0;
    this.hintsUsed = 0;
    this.mistakes = 0;
    this.timeLeft = this.gameData?.timeLimit || 300;
  }

  preload() {
    // Create simple colored rectangles for drag items
    this.load.image('number-bg', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="80" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="60" fill="#3b82f6" rx="8"/>
      </svg>
    `));
    
    this.load.image('operator-bg', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" fill="#10b981" rx="8"/>
      </svg>
    `));
    
    this.load.image('drop-zone', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="80" fill="none" stroke="#6b7280" stroke-width="2" stroke-dasharray="5,5" rx="8"/>
      </svg>
    `));

    this.load.image('hint-icon', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    `));
  }

  create() {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    
    // UI Elements
    this.createUI();
    
    // Generate first problem
    this.generateProblem();
    
    // Start timer
    this.startTimer();
    
    // Emit game started event
    this.game.events.emit('game-started');
  }

  private createUI() {
    // Header background
    this.add.rectangle(400, 50, 800, 80, 0x2d3748, 0.8);
    
    // Score display
    this.scoreText = this.add.text(50, 30, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // Timer display
    this.timerText = this.add.text(400, 30, this.formatTime(this.timeLeft), {
      fontSize: '24px',
      fill: '#fbbf24',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Progress display
    this.add.text(650, 30, `Problem: ${this.problemsCompleted + 1}/${this.totalProblems}`, {
      fontSize: '20px',
      fill: '#10b981',
      fontFamily: 'Arial'
    });
    
    // Problem area background
    this.add.rectangle(400, 150, 700, 80, 0x374151, 0.8);
    
    // Problem text
    this.problemText = this.add.text(400, 150, '', {
      fontSize: '28px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Feedback text
    this.feedbackText = this.add.text(400, 500, '', {
      fontSize: '20px',
      fill: '#10b981',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Hint button
    this.createHintButton();
    
    // Next button (initially hidden)
    this.createNextButton();
  }

  private createHintButton() {
    const hintBg = this.add.rectangle(0, 0, 120, 40, 0x6366f1);
    const hintIcon = this.add.image(-30, 0, 'hint-icon').setScale(0.8);
    const hintText = this.add.text(10, 0, 'Hint', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.hintButton = this.add.container(700, 450, [hintBg, hintIcon, hintText]);
    this.hintButton.setSize(120, 40);
    this.hintButton.setInteractive({ useHandCursor: true });
    
    this.hintButton.on('pointerdown', () => {
      this.showHint();
    });
    
    this.hintButton.on('pointerover', () => {
      hintBg.setFillStyle(0x5b21b6);
    });
    
    this.hintButton.on('pointerout', () => {
      hintBg.setFillStyle(0x6366f1);
    });
  }

  private createNextButton() {
    const nextBg = this.add.rectangle(0, 0, 120, 40, 0x10b981);
    const nextText = this.add.text(0, 0, 'Next', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.nextButton = this.add.container(400, 450, [nextBg, nextText]);
    this.nextButton.setSize(120, 40);
    this.nextButton.setInteractive({ useHandCursor: true });
    this.nextButton.setVisible(false);
    
    this.nextButton.on('pointerdown', () => {
      this.nextProblem();
    });
    
    this.nextButton.on('pointerover', () => {
      nextBg.setFillStyle(0x059669);
    });
    
    this.nextButton.on('pointerout', () => {
      nextBg.setFillStyle(0x10b981);
    });
  }

  private generateProblem() {
    // Clear previous problem
    this.clearProblem();
    
    // Generate problem based on class level and curriculum
    const classLevel = this.gameData?.classLevel || 8;
    this.currentProblem = this.generateMathProblem(classLevel);
    
    // Display problem
    this.problemText.setText(this.currentProblem.question);
    
    // Create drag items
    this.createDragItems();
    
    // Create drop zones
    this.createDropZones();
    
    // Hide next button and feedback
    this.nextButton.setVisible(false);
    this.feedbackText.setText('');
  }

  private generateMathProblem(classLevel: number) {
    const problems = {
      6: this.generateClass6Problem(),
      7: this.generateClass7Problem(),
      8: this.generateClass8Problem(),
      9: this.generateClass9Problem(),
      10: this.generateClass10Problem(),
      11: this.generateClass11Problem(),
      12: this.generateClass12Problem()
    };
    
    return problems[classLevel as keyof typeof problems] || problems[8];
  }

  private generateClass6Problem() {
    const operations = ['+', '-', '×', '÷'];
    const operation = Phaser.Utils.Array.GetRandom(operations);
    let a: number, b: number, answer: number;
    
    switch (operation) {
      case '+':
        a = Phaser.Math.Between(10, 50);
        b = Phaser.Math.Between(10, 50);
        answer = a + b;
        break;
      case '-':
        a = Phaser.Math.Between(20, 80);
        b = Phaser.Math.Between(5, a - 5);
        answer = a - b;
        break;
      case '×':
        a = Phaser.Math.Between(2, 12);
        b = Phaser.Math.Between(2, 12);
        answer = a * b;
        break;
      case '÷':
        answer = Phaser.Math.Between(2, 12);
        b = Phaser.Math.Between(2, 12);
        a = answer * b;
        break;
      default:
        a = 10; b = 5; answer = 15; operation = '+';
    }
    
    return {
      question: `Solve: ${a} ${operation} ${b} = ?`,
      correctAnswer: answer.toString(),
      dragItems: this.generateNumberOptions(answer),
      hint: `Think about ${operation === '×' ? 'multiplication' : operation === '÷' ? 'division' : operation === '+' ? 'addition' : 'subtraction'} step by step.`
    };
  }

  private generateClass8Problem() {
    const problemTypes = ['linear_equation', 'algebraic_expression', 'fraction'];
    const type = Phaser.Utils.Array.GetRandom(problemTypes);
    
    switch (type) {
      case 'linear_equation':
        const x = Phaser.Math.Between(2, 10);
        const a = Phaser.Math.Between(2, 5);
        const b = Phaser.Math.Between(1, 20);
        const result = a * x + b;
        return {
          question: `Solve for x: ${a}x + ${b} = ${result}`,
          correctAnswer: x.toString(),
          dragItems: this.generateNumberOptions(x),
          hint: `Subtract ${b} from both sides, then divide by ${a}.`
        };
        
      case 'algebraic_expression':
        const coeff1 = Phaser.Math.Between(2, 8);
        const coeff2 = Phaser.Math.Between(2, 8);
        const answer = coeff1 + coeff2;
        return {
          question: `Simplify: ${coeff1}x + ${coeff2}x = ?`,
          correctAnswer: `${answer}x`,
          dragItems: [`${answer}x`, `${coeff1 * coeff2}x`, `${answer}`, `${coeff1}x + ${coeff2}x`],
          hint: `Combine like terms by adding the coefficients.`
        };
        
      default:
        return this.generateClass6Problem();
    }
  }

  private generateClass9Problem() {
    // Quadratic equations, geometry
    const a = Phaser.Math.Between(1, 3);
    const b = Phaser.Math.Between(1, 10);
    const c = Phaser.Math.Between(1, 10);
    
    return {
      question: `If x² + ${b}x + ${c} = 0, what are the factors?`,
      correctAnswer: `(x + ${Math.sqrt(c)})(x + ${Math.sqrt(c)})`, // Simplified
      dragItems: [`(x + ${Math.sqrt(c)})(x + ${Math.sqrt(c)})`, `(x + ${b})(x + 1)`, `x(x + ${b + c})`, `Cannot factor`],
      hint: `Look for two numbers that multiply to ${c} and add to ${b}.`
    };
  }

  private generateClass10Problem() {
    // Trigonometry, coordinate geometry
    const angle = Phaser.Utils.Array.GetRandom([30, 45, 60, 90]);
    const trigValues: { [key: number]: { sin: string, cos: string, tan: string } } = {
      30: { sin: '1/2', cos: '√3/2', tan: '1/√3' },
      45: { sin: '√2/2', cos: '√2/2', tan: '1' },
      60: { sin: '√3/2', cos: '1/2', tan: '√3' },
      90: { sin: '1', cos: '0', tan: 'undefined' }
    };
    
    const func = Phaser.Utils.Array.GetRandom(['sin', 'cos', 'tan']);
    
    return {
      question: `What is ${func}(${angle}°)?`,
      correctAnswer: trigValues[angle][func as keyof typeof trigValues[30]],
      dragItems: [
        trigValues[angle].sin,
        trigValues[angle].cos,
        trigValues[angle].tan,
        '0'
      ],
      hint: `Remember the special triangle ratios for ${angle}°.`
    };
  }

  private generateClass11Problem() {
    // Advanced algebra, calculus basics
    return {
      question: `Find the derivative of f(x) = 3x² + 2x + 1`,
      correctAnswer: `6x + 2`,
      dragItems: [`6x + 2`, `3x + 2`, `6x² + 2x`, `6x + 1`],
      hint: `Use the power rule: d/dx(xⁿ) = nxⁿ⁻¹`
    };
  }

  private generateClass12Problem() {
    // Calculus, advanced topics
    return {
      question: `∫(2x + 3)dx = ?`,
      correctAnswer: `x² + 3x + C`,
      dragItems: [`x² + 3x + C`, `2x² + 3x + C`, `x² + 3x`, `2x + 3x + C`],
      hint: `Use the power rule for integration: ∫xⁿdx = xⁿ⁺¹/(n+1) + C`
    };
  }

  private generateClass7Problem() {
    // Basic algebra and fractions
    const num1 = Phaser.Math.Between(1, 5);
    const den1 = Phaser.Math.Between(2, 8);
    const num2 = Phaser.Math.Between(1, 5);
    const den2 = den1; // Same denominator for simplicity
    
    const answerNum = num1 + num2;
    
    return {
      question: `Add the fractions: ${num1}/${den1} + ${num2}/${den2} = ?`,
      correctAnswer: `${answerNum}/${den1}`,
      dragItems: [`${answerNum}/${den1}`, `${num1 + num2}/${den1 + den2}`, `${num1 * num2}/${den1}`, `${answerNum}/${den1 * 2}`],
      hint: `When denominators are the same, just add the numerators.`
    };
  }

  private generateNumberOptions(correctAnswer: number): string[] {
    const options = [correctAnswer.toString()];
    
    // Add some wrong options
    for (let i = 0; i < 3; i++) {
      let wrongAnswer;
      do {
        wrongAnswer = correctAnswer + Phaser.Math.Between(-5, 5);
      } while (wrongAnswer === correctAnswer || options.includes(wrongAnswer.toString()));
      
      options.push(wrongAnswer.toString());
    }
    
    return Phaser.Utils.Array.Shuffle(options);
  }

  private createDragItems() {
    const startX = 150;
    const startY = 300;
    const spacing = 120;
    
    this.currentProblem.dragItems.forEach((item: string, index: number) => {
      const container = this.add.container(startX + (index * spacing), startY);
      
      // Background
      const bg = this.add.image(0, 0, 'number-bg');
      
      // Text
      const text = this.add.text(0, 0, item, {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5);
      
      container.add([bg, text]);
      container.setSize(80, 60);
      container.setInteractive({ draggable: true, useHandCursor: true });
      
      // Store original position
      (container as any).originalX = container.x;
      (container as any).originalY = container.y;
      (container as any).value = item;
      
      // Drag events
      container.on('dragstart', () => {
        container.setScale(1.1);
        this.children.bringToTop(container);
      });
      
      container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        container.setPosition(dragX, dragY);
      });
      
      container.on('dragend', () => {
        container.setScale(1);
        this.checkDrop(container);
      });
      
      this.dragItems.push(container);
    });
  }

  private createDropZones() {
    const dropZone = this.add.zone(400, 380, 100, 80);
    dropZone.setRectangleDropZone(100, 80);
    
    // Visual representation
    this.add.image(400, 380, 'drop-zone');
    this.add.text(400, 380, 'Drop Answer Here', {
      fontSize: '14px',
      fill: '#6b7280',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.dropZones.push(dropZone);
  }

  private checkDrop(draggedItem: Phaser.GameObjects.Container) {
    const dropZone = this.dropZones[0];
    const bounds = dropZone.getBounds();
    
    if (Phaser.Geom.Rectangle.Contains(bounds, draggedItem.x, draggedItem.y)) {
      // Snap to drop zone
      draggedItem.setPosition(dropZone.x, dropZone.y);
      
      // Check if answer is correct
      const isCorrect = (draggedItem as any).value === this.currentProblem.correctAnswer;
      
      if (isCorrect) {
        this.handleCorrectAnswer();
      } else {
        this.handleWrongAnswer();
      }
    } else {
      // Return to original position
      this.tweens.add({
        targets: draggedItem,
        x: (draggedItem as any).originalX,
        y: (draggedItem as any).originalY,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  private handleCorrectAnswer() {
    this.score += 100;
    this.problemsCompleted++;
    
    this.scoreText.setText(`Score: ${this.score}`);
    this.feedbackText.setText('Correct! Well done!');
    this.feedbackText.setFill('#10b981');
    
    // Update game events
    this.game.events.emit('score-updated', this.score);
    this.game.events.emit('progress-updated', (this.problemsCompleted / this.totalProblems) * 100);
    
    // Show next button or complete game
    if (this.problemsCompleted >= this.totalProblems) {
      this.completeGame();
    } else {
      this.nextButton.setVisible(true);
    }
  }

  private handleWrongAnswer() {
    this.mistakes++;
    this.feedbackText.setText('Try again! Think carefully about the problem.');
    this.feedbackText.setFill('#ef4444');
    
    this.game.events.emit('mistake-made');
  }

  private showHint() {
    this.hintsUsed++;
    this.feedbackText.setText(`Hint: ${this.currentProblem.hint}`);
    this.feedbackText.setFill('#fbbf24');
    
    this.game.events.emit('hint-used');
  }

  private nextProblem() {
    if (this.problemsCompleted < this.totalProblems) {
      this.generateProblem();
    }
  }

  private clearProblem() {
    // Remove drag items
    this.dragItems.forEach(item => item.destroy());
    this.dragItems = [];
    
    // Remove drop zones (keep the visual elements)
    this.dropZones = [];
  }

  private startTimer() {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--;
        this.timerText.setText(this.formatTime(this.timeLeft));
        
        if (this.timeLeft <= 0) {
          this.completeGame();
        }
      },
      loop: true
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private completeGame() {
    const finalScore = Math.round((this.score / (this.totalProblems * 100)) * 100);
    
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    const completionText = this.add.text(400, 250, 'Game Complete!', {
      fontSize: '48px',
      fill: '#10b981',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const statsText = this.add.text(400, 350, 
      `Final Score: ${finalScore}%\n` +
      `Problems Solved: ${this.problemsCompleted}/${this.totalProblems}\n` +
      `Hints Used: ${this.hintsUsed}\n` +
      `Mistakes: ${this.mistakes}`, {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Emit completion event
    this.game.events.emit('game-completed', finalScore);
  }
}

export default MathDragDropScene;

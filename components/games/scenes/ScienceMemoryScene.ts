// Science Memory Card Game Scene
// Match scientific terms with definitions, diagrams, or processes
// Covers Physics, Chemistry, Biology as per Odisha curriculum

export class ScienceMemoryScene extends Phaser.Scene {
  private gameData: any;
  private cards: Phaser.GameObjects.Container[] = [];
  private flippedCards: Phaser.GameObjects.Container[] = [];
  private matchedPairs: number = 0;
  private totalPairs: number = 8;
  private score: number = 0;
  private moves: number = 0;
  private timeLeft: number = 180; // 3 minutes
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private hintsUsed: number = 0;
  private mistakes: number = 0;
  private cardData: { id: number, content: string, pair: number, type: 'term' | 'definition' }[] = [];
  private isProcessing: boolean = false;

  constructor() {
    super({ key: 'ScienceMemoryScene' });
  }

  init(data: any) {
    this.gameData = data;
    this.score = 0;
    this.moves = 0;
    this.matchedPairs = 0;
    this.hintsUsed = 0;
    this.mistakes = 0;
    this.timeLeft = this.gameData?.timeLimit || 180;
    this.isProcessing = false;
    this.flippedCards = [];
  }

  preload() {
    // Create card graphics
    this.load.image('card-back', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="#1e40af" rx="12"/>
        <circle cx="60" cy="80" r="30" fill="#3b82f6"/>
        <text x="60" y="85" font-family="Arial" font-size="24" fill="white" text-anchor="middle">?</text>
      </svg>
    `));
    
    this.load.image('card-front-term', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="#10b981" rx="12"/>
      </svg>
    `));
    
    this.load.image('card-front-definition', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="#8b5cf6" rx="12"/>
      </svg>
    `));
    
    this.load.image('card-matched', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="160" fill="#fbbf24" rx="12"/>
      </svg>
    `));

    this.load.image('hint-icon', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    `));
  }

  create() {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);
    
    // UI Elements
    this.createUI();
    
    // Generate science content based on class level
    this.generateScienceContent();
    
    // Create cards
    this.createCards();
    
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
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    
    // Moves display
    this.movesText = this.add.text(200, 30, 'Moves: 0', {
      fontSize: '20px',
      fill: '#10b981',
      fontFamily: 'Arial'
    });
    
    // Timer display
    this.timerText = this.add.text(400, 30, this.formatTime(this.timeLeft), {
      fontSize: '20px',
      fill: '#fbbf24',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Progress display
    this.add.text(600, 30, `Pairs: 0/${this.totalPairs}`, {
      fontSize: '20px',
      fill: '#8b5cf6',
      fontFamily: 'Arial'
    });
    
    // Instructions
    this.add.text(400, 100, 'Match scientific terms with their definitions!', {
      fontSize: '18px',
      fill: '#9ca3af',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Hint button
    this.createHintButton();
  }

  private createHintButton() {
    const hintBg = this.add.rectangle(0, 0, 100, 35, 0x6366f1);
    const hintIcon = this.add.image(-25, 0, 'hint-icon').setScale(0.7);
    const hintText = this.add.text(10, 0, 'Hint', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const hintButton = this.add.container(700, 100, [hintBg, hintIcon, hintText]);
    hintButton.setSize(100, 35);
    hintButton.setInteractive({ useHandCursor: true });
    
    hintButton.on('pointerdown', () => {
      this.showHint();
    });
    
    hintButton.on('pointerover', () => {
      hintBg.setFillStyle(0x5b21b6);
    });
    
    hintButton.on('pointerout', () => {
      hintBg.setFillStyle(0x6366f1);
    });
  }

  private generateScienceContent() {
    const classLevel = this.gameData?.classLevel || 8;
    
    const contentByClass = {
      6: this.getClass6Content(),
      7: this.getClass7Content(),
      8: this.getClass8Content(),
      9: this.getClass9Content(),
      10: this.getClass10Content(),
      11: this.getClass11Content(),
      12: this.getClass12Content()
    };
    
    const content = contentByClass[classLevel as keyof typeof contentByClass] || contentByClass[8];
    
    // Create card data with pairs
    this.cardData = [];
    content.forEach((pair, index) => {
      this.cardData.push(
        { id: index * 2, content: pair.term, pair: index, type: 'term' },
        { id: index * 2 + 1, content: pair.definition, pair: index, type: 'definition' }
      );
    });
    
    // Shuffle the cards
    this.cardData = Phaser.Utils.Array.Shuffle(this.cardData);
  }

  private getClass6Content() {
    return [
      { term: 'Photosynthesis', definition: 'Process by which plants make food using sunlight' },
      { term: 'Evaporation', definition: 'Change of liquid to gas due to heat' },
      { term: 'Condensation', definition: 'Change of gas to liquid due to cooling' },
      { term: 'Habitat', definition: 'Natural home of living organisms' },
      { term: 'Herbivore', definition: 'Animals that eat only plants' },
      { term: 'Carnivore', definition: 'Animals that eat only meat' },
      { term: 'Omnivore', definition: 'Animals that eat both plants and meat' },
      { term: 'Renewable Energy', definition: 'Energy that can be replenished naturally' }
    ];
  }

  private getClass8Content() {
    return [
      { term: 'Atom', definition: 'Smallest unit of matter that retains properties' },
      { term: 'Molecule', definition: 'Two or more atoms bonded together' },
      { term: 'Force', definition: 'Push or pull that can change motion of object' },
      { term: 'Friction', definition: 'Force that opposes motion between surfaces' },
      { term: 'Reflection', definition: 'Bouncing back of light from a surface' },
      { term: 'Refraction', definition: 'Bending of light when passing through media' },
      { term: 'Cell', definition: 'Basic structural unit of all living things' },
      { term: 'Tissue', definition: 'Group of similar cells working together' }
    ];
  }

  private getClass9Content() {
    return [
      { term: 'Gravitation', definition: 'Force of attraction between any two masses' },
      { term: 'Acceleration', definition: 'Rate of change of velocity with time' },
      { term: 'Momentum', definition: 'Product of mass and velocity of object' },
      { term: 'Work', definition: 'Force applied over a distance' },
      { term: 'Power', definition: 'Rate of doing work or energy transfer' },
      { term: 'Tissue System', definition: 'Group of tissues performing specific function' },
      { term: 'Natural Selection', definition: 'Survival of organisms best adapted to environment' },
      { term: 'Heredity', definition: 'Passing of traits from parents to offspring' }
    ];
  }

  private getClass10Content() {
    return [
      { term: 'Acid', definition: 'Substance that releases H+ ions in solution' },
      { term: 'Base', definition: 'Substance that releases OH- ions in solution' },
      { term: 'pH Scale', definition: 'Measure of acidity or alkalinity (0-14)' },
      { term: 'Oxidation', definition: 'Loss of electrons or gain of oxygen' },
      { term: 'Reduction', definition: 'Gain of electrons or loss of oxygen' },
      { term: 'Enzyme', definition: 'Protein that speeds up chemical reactions' },
      { term: 'Hormone', definition: 'Chemical messenger in living organisms' },
      { term: 'Homeostasis', definition: 'Maintaining stable internal conditions' }
    ];
  }

  private getClass11Content() {
    return [
      { term: 'Thermodynamics', definition: 'Study of heat and energy transfer' },
      { term: 'Entropy', definition: 'Measure of disorder in a system' },
      { term: 'Equilibrium', definition: 'State where forward and reverse rates are equal' },
      { term: 'Catalyst', definition: 'Substance that speeds reaction without being consumed' },
      { term: 'Organic Chemistry', definition: 'Study of carbon-containing compounds' },
      { term: 'Polymer', definition: 'Large molecule made of repeating units' },
      { term: 'DNA', definition: 'Genetic material containing hereditary information' },
      { term: 'RNA', definition: 'Nucleic acid involved in protein synthesis' }
    ];
  }

  private getClass12Content() {
    return [
      { term: 'Quantum Mechanics', definition: 'Physics of atomic and subatomic particles' },
      { term: 'Wave-Particle Duality', definition: 'Matter exhibits both wave and particle properties' },
      { term: 'Electrochemistry', definition: 'Study of chemical reactions involving electricity' },
      { term: 'Coordination Complex', definition: 'Central metal atom bonded to ligands' },
      { term: 'Biotechnology', definition: 'Use of living systems for technological applications' },
      { term: 'Genetic Engineering', definition: 'Direct manipulation of genes using technology' },
      { term: 'Ecosystem', definition: 'Community of organisms and their environment' },
      { term: 'Biodiversity', definition: 'Variety of life in ecosystems' }
    ];
  }

  private getClass7Content() {
    return [
      { term: 'Nutrition', definition: 'Process of obtaining and using food for growth' },
      { term: 'Respiration', definition: 'Process of breaking down food to release energy' },
      { term: 'Excretion', definition: 'Removal of waste products from body' },
      { term: 'Reproduction', definition: 'Process by which organisms produce offspring' },
      { term: 'Heat', definition: 'Form of energy that flows from hot to cold' },
      { term: 'Temperature', definition: 'Measure of hotness or coldness' },
      { term: 'Weather', definition: 'Day-to-day atmospheric conditions' },
      { term: 'Climate', definition: 'Average weather pattern over long period' }
    ];
  }

  private createCards() {
    const cols = 4;
    const rows = 4;
    const cardWidth = 120;
    const cardHeight = 160;
    const startX = 400 - (cols * cardWidth) / 2 + cardWidth / 2;
    const startY = 300 - (rows * cardHeight) / 2 + cardHeight / 2 + 20;
    
    this.cardData.forEach((cardInfo, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + 10);
      const y = startY + row * (cardHeight + 10);
      
      const card = this.createCard(x, y, cardInfo);
      this.cards.push(card);
    });
  }

  private createCard(x: number, y: number, cardInfo: any): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Card back (initially visible)
    const cardBack = this.add.image(0, 0, 'card-back');
    
    // Card front (initially hidden)
    const cardFrontBg = this.add.image(0, 0, 
      cardInfo.type === 'term' ? 'card-front-term' : 'card-front-definition'
    ).setVisible(false);
    
    // Text on front of card
    const cardText = this.add.text(0, 0, cardInfo.content, {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 100, useAdvancedWrap: true }
    }).setOrigin(0.5).setVisible(false);
    
    container.add([cardBack, cardFrontBg, cardText]);
    container.setSize(120, 160);
    container.setInteractive({ useHandCursor: true });
    
    // Store card data
    (container as any).cardInfo = cardInfo;
    (container as any).isFlipped = false;
    (container as any).isMatched = false;
    (container as any).cardBack = cardBack;
    (container as any).cardFront = cardFrontBg;
    (container as any).cardText = cardText;
    
    // Click event
    container.on('pointerdown', () => {
      this.flipCard(container);
    });
    
    // Hover effects
    container.on('pointerover', () => {
      if (!(container as any).isMatched) {
        container.setScale(1.05);
      }
    });
    
    container.on('pointerout', () => {
      container.setScale(1);
    });
    
    return container;
  }

  private flipCard(card: Phaser.GameObjects.Container) {
    if (this.isProcessing || (card as any).isFlipped || (card as any).isMatched) {
      return;
    }
    
    if (this.flippedCards.length >= 2) {
      return;
    }
    
    // Flip animation
    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        // Show front of card
        (card as any).cardBack.setVisible(false);
        (card as any).cardFront.setVisible(true);
        (card as any).cardText.setVisible(true);
        (card as any).isFlipped = true;
        
        this.tweens.add({
          targets: card,
          scaleX: 1,
          duration: 150
        });
      }
    });
    
    this.flippedCards.push(card);
    
    // Check for match when 2 cards are flipped
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.movesText.setText(`Moves: ${this.moves}`);
      
      this.time.delayedCall(1000, () => {
        this.checkMatch();
      });
    }
  }

  private checkMatch() {
    this.isProcessing = true;
    
    const card1 = this.flippedCards[0];
    const card2 = this.flippedCards[1];
    
    const isMatch = (card1 as any).cardInfo.pair === (card2 as any).cardInfo.pair;
    
    if (isMatch) {
      // Match found
      this.handleMatch(card1, card2);
    } else {
      // No match
      this.handleNoMatch(card1, card2);
    }
    
    this.flippedCards = [];
    this.isProcessing = false;
  }

  private handleMatch(card1: Phaser.GameObjects.Container, card2: Phaser.GameObjects.Container) {
    this.matchedPairs++;
    this.score += 100;
    
    // Mark cards as matched
    (card1 as any).isMatched = true;
    (card2 as any).isMatched = true;
    
    // Change card appearance
    (card1 as any).cardFront.setTexture('card-matched');
    (card2 as any).cardFront.setTexture('card-matched');
    
    // Update UI
    this.scoreText.setText(`Score: ${this.score}`);
    
    // Update progress
    this.game.events.emit('score-updated', this.score);
    this.game.events.emit('progress-updated', (this.matchedPairs / this.totalPairs) * 100);
    
    // Check if game is complete
    if (this.matchedPairs >= this.totalPairs) {
      this.completeGame();
    }
    
    // Visual feedback
    this.tweens.add({
      targets: [card1, card2],
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private handleNoMatch(card1: Phaser.GameObjects.Container, card2: Phaser.GameObjects.Container) {
    this.mistakes++;
    this.game.events.emit('mistake-made');
    
    // Flip cards back
    [card1, card2].forEach(card => {
      this.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 150,
        onComplete: () => {
          (card as any).cardBack.setVisible(true);
          (card as any).cardFront.setVisible(false);
          (card as any).cardText.setVisible(false);
          (card as any).isFlipped = false;
          
          this.tweens.add({
            targets: card,
            scaleX: 1,
            duration: 150
          });
        }
      });
    });
  }

  private showHint() {
    this.hintsUsed++;
    this.game.events.emit('hint-used');
    
    // Find an unmatched pair and briefly show them
    const unmatchedCards = this.cards.filter(card => !(card as any).isMatched);
    
    if (unmatchedCards.length >= 2) {
      // Find a matching pair
      for (let i = 0; i < unmatchedCards.length; i++) {
        for (let j = i + 1; j < unmatchedCards.length; j++) {
          const card1 = unmatchedCards[i];
          const card2 = unmatchedCards[j];
          
          if ((card1 as any).cardInfo.pair === (card2 as any).cardInfo.pair) {
            // Highlight these cards briefly
            this.tweens.add({
              targets: [card1, card2],
              alpha: 0.5,
              duration: 300,
              yoyo: true,
              repeat: 2
            });
            return;
          }
        }
      }
    }
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
    const completionBonus = this.timeLeft > 0 ? this.timeLeft * 2 : 0;
    const finalScore = Math.round(((this.matchedPairs / this.totalPairs) * 70) + 
                                 (completionBonus / 10) + 
                                 (Math.max(0, 50 - this.moves) / 2));
    
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    const completionText = this.add.text(400, 200, 'Memory Game Complete!', {
      fontSize: '36px',
      fill: '#10b981',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    const statsText = this.add.text(400, 300, 
      `Final Score: ${finalScore}%\n` +
      `Pairs Matched: ${this.matchedPairs}/${this.totalPairs}\n` +
      `Moves Used: ${this.moves}\n` +
      `Time Remaining: ${this.formatTime(this.timeLeft)}\n` +
      `Hints Used: ${this.hintsUsed}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    // Performance feedback
    let performanceText = '';
    if (finalScore >= 90) {
      performanceText = 'Excellent! You have great memory skills!';
    } else if (finalScore >= 75) {
      performanceText = 'Good job! Keep practicing to improve!';
    } else if (finalScore >= 60) {
      performanceText = 'Not bad! Try to be more efficient next time.';
    } else {
      performanceText = 'Keep trying! Practice makes perfect!';
    }
    
    this.add.text(400, 450, performanceText, {
      fontSize: '18px',
      fill: '#fbbf24',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // Emit completion event
    this.game.events.emit('game-completed', finalScore);
  }
}

export default ScienceMemoryScene;

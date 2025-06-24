export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 12;
  private static readonly MIN_ENTROPY = 50; // bits

  // Validation robuste du mot de passe
  static validatePassword(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Longueur
    if (password.length < 8) {
      feedback.push('Le mot de passe doit contenir au moins 8 caractères');
      return { score: 0, feedback, isValid: false };
    }
    if (password.length >= this.MIN_LENGTH) score++;

    // Complexité
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigits = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasLower) feedback.push('Ajoutez des lettres minuscules');
    if (!hasUpper) feedback.push('Ajoutez des lettres majuscules');
    if (!hasDigits) feedback.push('Ajoutez des chiffres');
    if (!hasSpecial) feedback.push('Ajoutez des caractères spéciaux');

    const complexityTypes = [hasLower, hasUpper, hasDigits, hasSpecial].filter(Boolean).length;
    if (complexityTypes >= 3) score++;
    if (complexityTypes >= 4) score++;

    // Entropie
    const entropy = this.calculateEntropy(password);
    if (entropy >= this.MIN_ENTROPY) score++;
    if (entropy >= 80) score++; // Très forte entropie

    // Mots de passe communs
    if (this.isCommonPassword(password)) {
      feedback.push('Ce mot de passe est trop commun');
      score = Math.max(0, score - 2);
    }

    // Patterns répétitifs
    if (this.hasRepeatingPatterns(password)) {
      feedback.push('Évitez les motifs répétitifs (ex: 123, abc, aaa)');
      score = Math.max(0, score - 1);
    }

    const isValid = score >= 3 && feedback.length === 0;
    
    if (feedback.length === 0) {
      feedback.push(this.getStrengthMessage(score));
    }

    return { score, feedback, isValid };
  }

  // Calcul de l'entropie
  private static calculateEntropy(password: string): number {
    const charSets = [
      /[a-z]/.test(password) ? 26 : 0, // minuscules
      /[A-Z]/.test(password) ? 26 : 0, // majuscules
      /\d/.test(password) ? 10 : 0,     // chiffres
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 32 : 0 // spéciaux
    ];
    
    const charsetSize = charSets.reduce((sum, size) => sum + size, 0);
    return password.length * Math.log2(charsetSize);
  }

  // Vérification des mots de passe communs (liste basique)
  private static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', 'monkey', 'dragon',
      '123456789', 'password1', 'qwerty123'
    ];
    
    return commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
  }

  // Détection de motifs répétitifs
  private static hasRepeatingPatterns(password: string): boolean {
    // Caractères répétés (ex: aaa, 111)
    if (/(.)\1{2,}/.test(password)) return true;
    
    // Séquences numériques (ex: 123, 456)
    if (/(012|123|234|345|456|567|678|789)/.test(password)) return true;
    
    // Séquences alphabétiques (ex: abc, def)
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) return true;
    
    // Motifs de clavier (ex: qwerty, asdf)
    if (/(qwer|wert|erty|asdf|sdfg|dfgh|zxcv|xcvb|cvbn)/i.test(password)) return true;
    
    return false;
  }

  private static getStrengthMessage(score: number): string {
    switch (score) {
      case 0: return '❌ Très faible - Non recommandé';
      case 1: return '🔴 Faible - Augmentez la complexité';
      case 2: return '🟡 Moyen - Peut être amélioré';
      case 3: return '🟢 Fort - Bon niveau de sécurité';
      case 4: return '🔵 Très fort - Excellent !';
      default: return '';
    }
  }

  // Génération de mot de passe sécurisé
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + special;
    let password = '';
    
    // Garantir au moins un caractère de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Remplir le reste
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger les caractères
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Protection contre les attaques par brute force côté client
  static async addClientSideDelay(attempts: number): Promise<void> {
    if (attempts <= 3) return;
    
    // Délai exponentiel: 2^(attempts-3) secondes
    const delay = Math.pow(2, attempts - 3) * 1000;
    const maxDelay = 60000; // Max 1 minute
    
    await new Promise(resolve => 
      setTimeout(resolve, Math.min(delay, maxDelay))
    );
  }
}

// Gestionnaire d'historique des tentatives
export class LoginAttemptManager {
  private static readonly STORAGE_KEY = 'login_attempts';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static recordFailure(userId: string): boolean {
    const attempts = this.getAttempts(userId);
    attempts.count++;
    attempts.lastAttempt = Date.now();
    
    this.saveAttempts(userId, attempts);
    
    return attempts.count >= this.MAX_ATTEMPTS;
  }

  static recordSuccess(userId: string): void {
    this.clearAttempts(userId);
  }

  static isLockedOut(userId: string): boolean {
    const attempts = this.getAttempts(userId);
    
    if (attempts.count < this.MAX_ATTEMPTS) return false;
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt > this.LOCKOUT_DURATION) {
      this.clearAttempts(userId);
      return false;
    }
    
    return true;
  }

  static getRemainingLockoutTime(userId: string): number {
    const attempts = this.getAttempts(userId);
    if (attempts.count < this.MAX_ATTEMPTS) return 0;
    
    const elapsed = Date.now() - attempts.lastAttempt;
    return Math.max(0, this.LOCKOUT_DURATION - elapsed);
  }

  private static getAttempts(userId: string): { count: number; lastAttempt: number } {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : { count: 0, lastAttempt: 0 };
    } catch {
      return { count: 0, lastAttempt: 0 };
    }
  }

  private static saveAttempts(userId: string, attempts: { count: number; lastAttempt: number }): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(attempts));
    } catch {
      // Ignore si localStorage n'est pas disponible
    }
  }

  private static clearAttempts(userId: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    } catch {
      // Ignore si localStorage n'est pas disponible
    }
  }
}
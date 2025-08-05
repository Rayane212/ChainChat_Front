// src/components/crypto/UnlockKeysDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useE2EE } from '@/hooks/useE2EE';
import { PasswordValidator, LoginAttemptManager } from '@/E2E/passwordValidator';
import { Lock, Unlock, Key, Shield, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UnlockKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UnlockKeysDialog({ open, onOpenChange, onSuccess }: UnlockKeysDialogProps) {
  const { initializeKeys, isInitializing, hasKeys } = useE2EE();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Vérifier le verrouillage au montage
  useEffect(() => {
    const userId = 'current-user-id'; // À récupérer du contexte auth
    const locked = LoginAttemptManager.isLockedOut(userId);
    setIsLocked(locked);
    
    if (locked) {
      const remaining = LoginAttemptManager.getRemainingLockoutTime(userId);
      setLockoutTime(remaining);
    }
  }, []);

  // Timer pour le décompte de verrouillage
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            setIsLocked(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  // Validation du mot de passe en temps réel
  useEffect(() => {
    if (password.length > 0) {
      const result = PasswordValidator.validatePassword(password);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [password]);

  const handleUnlock = async () => {
    const userId = 'current-user-id'; // À récupérer du contexte auth

    if (isLocked) {
      toast.error('Too many failed attempts. Please wait.');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      // Ajouter un délai client-side pour les tentatives répétées
      await PasswordValidator.addClientSideDelay(attempts);

      const success = await initializeKeys(password);

      if (success) {
        // Succès - réinitialiser les tentatives
        LoginAttemptManager.recordSuccess(userId);
        setAttempts(0);
        setPassword('');
        onSuccess?.();
        onOpenChange(false);
        
      } else {
        // Échec - enregistrer la tentative
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        const locked = LoginAttemptManager.recordFailure(userId);
        
        if (locked) {
          setIsLocked(true);
          const remaining = LoginAttemptManager.getRemainingLockoutTime(userId);
          setLockoutTime(remaining);
          toast.error('Too many failed attempts. Account temporarily locked.');
        } else {
          toast.error(`Invalid password. ${5 - newAttempts} attempts remaining.`);
        }
      }

    } catch (error) {
      console.error('Unlock error:', error);
      toast.error('Failed to unlock keys');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInitializing && !isLocked) {
      handleUnlock();
    }
  };

  const formatLockoutTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPasswordStrengthColor = (score: number): string => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-purple-500/20">
            {isLocked ? (
              <Lock className="w-8 h-8 text-red-400" />
            ) : (
              <Key className="w-8 h-8 text-purple-400" />
            )}
          </div>
          <DialogTitle className="text-xl text-foreground">
            {hasKeys ? 'Unlock Your Keys' : 'Setup Encryption Keys'}
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            {hasKeys 
              ? 'Enter your password to decrypt your messaging keys'
              : 'Create a password to secure your end-to-end encryption keys'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Indicateur de sécurité */}
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="flex items-center space-x-3 p-4">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-400">End-to-End Encrypted</p>
                <p className="text-xs text-green-300/80">Your keys never leave your device</p>
              </div>
            </CardContent>
          </Card>

          {/* Champ mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              {hasKeys ? 'Password' : 'Create Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={hasKeys ? 'Enter your password' : 'Create a strong password'}
                className="pr-10 bg-background/50 border-border focus:border-purple-500/50"
                disabled={isInitializing || isLocked}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isInitializing || isLocked}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-foreground-muted" />
                ) : (
                  <Eye className="w-4 h-4 text-foreground-muted" />
                )}
              </Button>
            </div>

            {/* Validation du mot de passe pour création */}
            {!hasKeys && validationResult && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={(validationResult.score / 4) * 100} 
                    className="flex-1 h-2"
                  />
                  <span className="text-xs text-foreground-muted">
                    {validationResult.score}/4
                  </span>
                </div>
                <div className="space-y-1">
                  {validationResult.feedback.map((feedback: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      {validationResult.isValid ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                      )}
                      <span className={validationResult.isValid ? 'text-green-400' : 'text-yellow-400'}>
                        {feedback}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message de verrouillage */}
          {isLocked && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="flex items-center space-x-3 p-4">
                <Lock className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-400">Account Temporarily Locked</p>
                  <p className="text-xs text-red-300/80">
                    Too many failed attempts. Try again in {formatLockoutTime(lockoutTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tentatives restantes */}
          {attempts > 0 && !isLocked && (
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="flex items-center space-x-3 p-4">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">
                    {5 - attempts} attempts remaining
                  </p>
                  <p className="text-xs text-yellow-300/80">
                    Account will be locked after 5 failed attempts
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boutons d'action */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border hover:bg-muted"
              disabled={isInitializing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={
                isInitializing || 
                isLocked || 
                !password.trim() || 
                (!hasKeys && (!validationResult?.isValid))
              }
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {hasKeys ? 'Unlocking...' : 'Setting up...'}
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  {hasKeys ? 'Unlock' : 'Setup Keys'}
                </>
              )}
            </Button>
          </div>

          {/* Information de sécurité */}
          <div className="text-center text-xs text-foreground-muted">
            <p>Your password is used to encrypt your private keys locally.</p>
            <p>It never leaves your device and cannot be recovered if lost.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


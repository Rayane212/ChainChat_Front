import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useE2EE } from '@/hooks/useE2EE';
import { PasswordValidator } from '@/E2E/passwordValidator';
import { Lock, Unlock, Key, Shield, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface UnlockKeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function UnlockKeysDialog({ open, onOpenChange, onSuccess }: UnlockKeysDialogProps) {
  const { createKeys, unlockKeys, isInitializing, hasKeys, keysStatus } = useE2EE();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(null);

  const isCreatingKeys = keysStatus === 'none';
  const isUnlockingKeys = keysStatus === 'exists';

  // ✅ DÉSACTIVÉ TEMPORAIREMENT - Sera géré côté serveur
  // Vérifier le verrouillage au montage
  useEffect(() => {
    // const userId = 'current-user-id'; // À récupérer du contexte auth
    // const locked = LoginAttemptManager.isLockedOut(userId);
    // setIsLocked(locked);
    
    // if (locked) {
    //   const remaining = LoginAttemptManager.getRemainingLockoutTime(userId);
    //   setLockoutTime(remaining);
    // }
    
    // État temporaire - pas de verrouillage côté client
    setIsLocked(false);
    setLockoutTime(0);
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

  // Validation du mot de passe en temps réel (seulement pour la création)
  useEffect(() => {
    if (isCreatingKeys && password.length > 0) {
      const result = PasswordValidator.validatePassword(password);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [password, isCreatingKeys]);

  const handleAction = async () => {
    // const userId = 'current-user-id'; // À récupérer du contexte auth

    if (isLocked) {
      toast.error('Too many failed attempts. Please wait.');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    // Validation spécifique pour la création de clés
    if (isCreatingKeys) {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      if (!validationResult?.isValid) {
        toast.error('Password does not meet security requirements');
        return;
      }
    }

    try {
      // ✅ DÉSACTIVÉ : Délai client-side supprimé (sera géré côté serveur)
      // await PasswordValidator.addClientSideDelay(attempts);

      let success = false;

      if (isCreatingKeys) {
        // 🔑 CRÉER des clés pour la première fois
        success = await createKeys(password);
      } else if (isUnlockingKeys) {
        // 🔓 DÉVERROUILLER des clés existantes
        success = await unlockKeys(password);
      }

      if (success) {
        // Succès - réinitialiser les tentatives
        // ✅ DÉSACTIVÉ : LoginAttemptManager.recordSuccess(userId);
        setAttempts(0);
        setPassword('');
        setConfirmPassword('');
        onSuccess?.();
        onOpenChange(false);
        
      } else {
        // Échec - incrémenter les tentatives locales (temporaire)
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // ✅ DÉSACTIVÉ : Logique de verrouillage sera gérée côté serveur
        // const locked = LoginAttemptManager.recordFailure(userId);
        
        // Simulation simple pour l'UI (temporaire)
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockoutTime(5 * 60 * 1000); // 5 minutes
          toast.error('Too many failed attempts. Account temporarily locked.');
        } else {
          toast.error(`Invalid password. ${5 - newAttempts} attempts remaining.`);
        }
      }

    } catch (error) {
      console.error('Action error:', error);
      toast.error(isCreatingKeys ? 'Failed to create keys' : 'Failed to unlock keys');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInitializing && !isLocked) {
      handleAction();
    }
  };

  const formatLockoutTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isFormValid = () => {
    if (!password.trim()) return false;
    
    if (isCreatingKeys) {
      return password === confirmPassword && validationResult?.isValid;
    }
    
    return true; // Pour le déverrouillage, juste le mot de passe suffit
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface border-border">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-purple-500/20">
            {isLocked ? (
              <Lock className="w-8 h-8 text-red-400" />
            ) : isCreatingKeys ? (
              <Plus className="w-8 h-8 text-blue-400" />
            ) : (
              <Key className="w-8 h-8 text-purple-400" />
            )}
          </div>
          <DialogTitle className="text-xl text-foreground">
            {isCreatingKeys 
              ? 'Setup Encryption Keys' 
              : 'Unlock Your Keys'
            }
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            {isCreatingKeys 
              ? 'Create a password to secure your end-to-end encryption keys. This password encrypts your private keys locally.' 
              : 'Enter your password to decrypt your messaging keys and start secure conversations.'
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
              {isCreatingKeys ? 'Create Password' : 'Password'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isCreatingKeys ? 'Create a strong password' : 'Enter your password'}
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
          </div>

          {/* Confirmation de mot de passe (seulement pour création) */}
          {isCreatingKeys && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
                  className="pr-10 bg-background/50 border-border focus:border-purple-500/50"
                  disabled={isInitializing || isLocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isInitializing || isLocked}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-foreground-muted" />
                  ) : (
                    <Eye className="w-4 h-4 text-foreground-muted" />
                  )}
                </Button>
              </div>

              {/* Vérification des mots de passe */}
              {password !== confirmPassword && confirmPassword.length > 0 && (
                <p className="text-sm text-red-400 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Passwords do not match</span>
                </p>
              )}
            </div>
          )}

          {/* Validation du mot de passe pour création */}
          {isCreatingKeys && validationResult && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Progress 
                  value={(validationResult.score / 5) * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-foreground-muted">
                  {validationResult.score}/5
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

          {/* Message de verrouillage */}
          {isLocked && (
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="flex items-center space-x-3 p-4">
                <Lock className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-400">Account Temporarily Locked</p>
                  <p className="text-xs text-red-300/80">
                    Try again in {formatLockoutTime(lockoutTime)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tentatives restantes (seulement pour déverrouillage) */}
          {isUnlockingKeys && attempts > 0 && !isLocked && (
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
              onClick={handleAction}
              disabled={isInitializing || isLocked || !isFormValid()}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isCreatingKeys ? 'Creating...' : 'Unlocking...'}
                </>
              ) : (
                <>
                  {isCreatingKeys ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Keys
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Information de sécurité */}
          <div className="text-center text-xs text-foreground-muted space-y-1">
            <p>Your password encrypts your private keys locally.</p>
            <p>It never leaves your device and cannot be recovered if lost.</p>
            {isCreatingKeys && (
              <p className="text-yellow-400">⚠️ Store this password safely - you cannot reset it!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
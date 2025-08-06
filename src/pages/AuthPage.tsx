import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Lock, User, Wallet, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';
import * as authService from '@/services/auth.service';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États des formulaires
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    emailOrUsername: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Validation des formulaires
  const isLoginValid = loginForm.emailOrUsername.length > 0 && loginForm.password.length > 0;
  const isRegisterValid = 
    registerForm.firstName.length > 0 &&
    registerForm.lastName.length > 0 &&
    registerForm.email.length > 0 &&
    registerForm.username.length > 0 &&
    registerForm.password.length >= 8 &&
    registerForm.password === registerForm.confirmPassword;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoginValid) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Utiliser le vrai service d'authentification
      await authLogin(loginForm.emailOrUsername, loginForm.password);
      
      toast.success('🎉 Welcome back!');
      navigate('/chat');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 401) {
        toast.error('❌ Invalid credentials');
      } else if (error.response?.status === 429) {
        toast.error('❌ Too many attempts. Please try again later.');
      } else if (error.message?.includes('Network')) {
        toast.error('❌ Connection error. Check if backend is running.');
      } else {
        toast.error('❌ Login failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isRegisterValid) {
      toast.error('Please check all fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Préparer les données pour l'API backend
      const registerData: authService.RegisterDto = {
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        birthday: new Date(Date.now()), // Mock birthday date removed in backend
        email: registerForm.email,
        username: registerForm.username,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      };

      // Utiliser le vrai service d'inscription
      await authService.register(registerData);

      // Auto-login après inscription réussie
      await authLogin(registerForm.email, registerForm.password);

      toast.success('🎉 Account created successfully! Welcome to ChainChat!');
      navigate('/chat');
      
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Gestion des erreurs spécifiques
      if (error.response?.status === 409) {
        toast.error('❌ Email or username already exists');
      } else if (error.response?.status === 400) {
        toast.error('❌ Invalid data. Please check your inputs.');
      } else if (error.message?.includes('Network')) {
        toast.error('❌ Connection error. Check if backend is running.');
      } else {
        toast.error('❌ Registration failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface opacity-80" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-gradient-to-r from-green-500/10 to-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 shadow-2xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ChainChat
          </h1>
          <p className="text-foreground-muted mt-2">Secure • Private • Decentralized</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-surface/95 backdrop-blur-xl border-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-purple-400 mr-2" />
              <CardTitle className="text-xl text-foreground">Welcome Back</CardTitle>
            </div>
            <CardDescription className="text-foreground-muted">
              Sign in to access your encrypted conversations
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-background/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* LOGIN FORM */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailOrUsername" className="text-foreground">Email or Username</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="emailOrUsername"
                        type="text"
                        placeholder="your@email.com or username"
                        value={loginForm.emailOrUsername}
                        onChange={(e) => setLoginForm({ ...loginForm, emailOrUsername: e.target.value })}
                        className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-foreground-muted" />
                        ) : (
                          <Eye className="w-4 h-4 text-foreground-muted" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={isLoading || !isLoginValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* REGISTER FORM */}
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-foreground">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="johndoe"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 pr-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-foreground-muted" />
                        ) : (
                          <Eye className="w-4 h-4 text-foreground-muted" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isLoading}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-foreground-muted" />
                        ) : (
                          <Eye className="w-4 h-4 text-foreground-muted" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {registerForm.password !== registerForm.confirmPassword && registerForm.confirmPassword.length > 0 && (
                    <p className="text-sm text-red-400">Passwords do not match</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={isLoading || !isRegisterValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-purple-300 text-center">
                🔒 End-to-end encrypted • Your keys never leave your device
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-foreground-muted">
          <p>Powered by Solana • Built for Privacy • Open Source</p>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Lock, User, ArrowLeft, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider'


export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth()

  const handleAuth = async (type: 'login' | 'signup') => {
    setIsLoading(true)
  
    await new Promise(resolve => setTimeout(resolve, 1500))
  
    const mockUser = {
      id: crypto.randomUUID(),
      username: 'Rayane',
      email: 'rayane@chainchat.sol'
    }
  
    login(mockUser)
    toast.success(type === 'login' ? 'Welcome back!' : 'Account created successfully!')
    navigate('/chat')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface opacity-80" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-gradient-to-r from-green-500/10 to-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button 
        <Button
          variant="ghost"
          className="mb-6 text-foreground-muted hover:text-foreground transition-smooth"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        */}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl solana-gradient glow-purple">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold solana-gradient-text">ChainChat</h1>
          <p className="text-foreground-muted mt-2">Secure messaging on Solana</p>
        </div>

        <Card className="bg-surface/80 backdrop-blur-sm border-border shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">Welcome</CardTitle>
            <CardDescription className="text-center text-foreground-muted">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-background/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <Button
                  className="w-full solana-gradient hover:opacity-90 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:glow-purple"
                  onClick={() => handleAuth('login')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
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
                      className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-background/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
                <Button
                  className="w-full solana-gradient hover:opacity-90 text-white font-semibold py-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:glow-purple"
                  onClick={() => handleAuth('signup')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-foreground-muted">Or continue with</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-4 border-border hover:bg-surface-hover hover:border-green-500/50 py-6 rounded-2xl transition-all duration-300 hover:scale-105"
                onClick={() => toast.info('Solana wallet integration coming soon!')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Solana Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
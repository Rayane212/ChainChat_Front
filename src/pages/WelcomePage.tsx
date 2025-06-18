import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Shield, Zap, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description: 'Military-grade encryption powered by Solana blockchain technology'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant messaging with sub-second latency on Solana network'
    },
    {
      icon: Users,
      title: 'Group Chats',
      description: 'Create secure group conversations with up to 1000 members'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface opacity-80" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-gradient-to-r from-green-500/10 to-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-2xl solana-gradient glow-purple">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 ml-2 animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-bold mb-6">
            <span className="solana-gradient-text">ChainChat</span>
          </h1>
          
          <p className="text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
            The future of secure messaging is here. Built on Solana blockchain for 
            ultimate privacy, speed, and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {features.map((feature, index) => (
            <Card key={index} className="bg-surface/80 backdrop-blur-sm border-border hover:border-purple-500/50 transition-all duration-300 hover:glow-purple group">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Ready to experience the future of messaging?
            </h2>
            <p className="text-foreground-muted mb-8 text-lg">
              Join thousands of users who trust ChainChat for their most important conversations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="solana-gradient hover:opacity-90 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:glow-purple group"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/chat')}
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mt-24 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold solana-gradient-text mb-2">50K+</div>
              <div className="text-foreground-muted">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold solana-gradient-text mb-2">1M+</div>
              <div className="text-foreground-muted">Messages Sent</div>
            </div>
            <div>
              <div className="text-3xl font-bold solana-gradient-text mb-2">99.9%</div>
              <div className="text-foreground-muted">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
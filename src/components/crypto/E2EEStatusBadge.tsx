import { useE2EE } from '@/hooks/useE2EE';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldX, Wifi, WifiOff } from 'lucide-react';

interface E2EEStatusBadgeProps {
  className?: string;
}

export function E2EEStatusBadge({ className }: E2EEStatusBadgeProps) {
  const { isSessionUnlocked, isConnected, hasKeys } = useE2EE();

  if (!hasKeys) {
    return (
      <Badge variant="outline" className={`${className} border-yellow-500/50 text-yellow-400`}>
        <Shield className="w-3 h-3 mr-1" />
        Setup Required
      </Badge>
    );
  }

  if (!isSessionUnlocked) {
    return (
      <Badge variant="outline" className={`${className} border-red-500/50 text-red-400`}>
        <ShieldX className="w-3 h-3 mr-1" />
        Locked
      </Badge>
    );
  }

  if (!isConnected) {
    return (
      <Badge variant="outline" className={`${className} border-orange-500/50 text-orange-400`}>
        <WifiOff className="w-3 h-3 mr-1" />
        Offline
      </Badge>
    );
  }

  return (
    <Badge className={`${className} bg-green-500/20 text-green-400 border-green-500/50`}>
      <ShieldCheck className="w-3 h-3 mr-1" />
      Secured
    </Badge>
  );
}
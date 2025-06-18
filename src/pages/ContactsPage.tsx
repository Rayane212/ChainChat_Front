import { Users } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="p-4 rounded-2xl bg-purple-500 inline-block">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Contacts</h2>
        <p className="text-foreground-muted max-w-md">
          Manage your contacts and discover new connections on the Solana network.
        </p>
      </div>
    </div>
  );
}
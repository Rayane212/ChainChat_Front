import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar, ContactList, Settings } from '@/components/chat';
import { MessageSquare, Users, SettingsIcon } from 'lucide-react';

type ComponentType = 'sidebar' | 'contacts' | 'settings';

export default function ComponentShowcase() {
  const [activeComponent, setActiveComponent] = useState<ComponentType>('sidebar');

  const components = [
    { id: 'sidebar' as ComponentType, label: 'Sidebar', icon: MessageSquare },
    { id: 'contacts' as ComponentType, label: 'Contacts', icon: Users },
    { id: 'settings' as ComponentType, label: 'Settings', icon: SettingsIcon }
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case 'sidebar':
        return <Sidebar />;
      case 'contacts':
        return <ContactList />;
      case 'settings':
        return <Settings />;
      default:
        return <Sidebar />;
    }
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Component Selector */}
      <div className="w-64 bg-surface border-r border-border p-4">
        <h1 className="text-xl font-bold text-foreground mb-6">Component Showcase</h1>
        <div className="space-y-2">
          {components.map((component) => {
            const Icon = component.icon;
            return (
              <Button
                key={component.id}
                variant={activeComponent === component.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeComponent === component.id 
                    ? "bg-purple-500 hover:bg-purple-600 text-white" 
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
                }`}
                onClick={() => setActiveComponent(component.id)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {component.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Component Display */}
      <div className="flex-1 flex">
        {renderComponent()}
        
        {/* Placeholder Content Area */}
        <div className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-purple-500/20 inline-block">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">ChainChat Components</h2>
            <p className="text-foreground-muted max-w-md">
              Select a component from the sidebar to preview the Telegram-inspired design
              with Solana aesthetics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
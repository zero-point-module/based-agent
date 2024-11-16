import { Navbar } from './navbar';
import { useState } from 'react';
import { useTransition } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

interface LayoutProps {
  agentName: string;
}

interface MenuItem {
  title: string;
  description: string;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Agents',
    description: 'Manage and interact with your AI agents',
    path: '/agents',
  },
  {
    title: 'My Account',
    description: 'View and update your personal settings',
    path: '/account',
  },
];

export default function Layout({ agentName = '' }: LayoutProps) {
  const navigate = useNavigate();
  const [_, startTransition] = useTransition();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <div
        className={`relative flex ${
          isCollapsed ? 'w-10' : 'w-[320px]'
        } flex-col border-r transition-all duration-300 ease-in-out`}
      >
        {/* Clickable area for expanding when collapsed */}
        {isCollapsed && (
          <div
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expand sidebar"
          />
        )}

        {/* Sidebar content */}
        <div
          className={`${
            isCollapsed ? 'invisible opacity-0' : 'visible opacity-100'
          } flex h-full flex-col gap-6 p-6 transition-all`}
        >
          <div>
            <h1 className="text-2xl font-bold">Hello Human</h1>
          </div>

          <div className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className="relative z-20 flex flex-col gap-1 rounded-md text-left"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-gray-500 text-muted-foreground">
                  {item.description}
                </span>
              </button>
            ))}
          </div>

          <div className="z-20 mt-auto pt-6">
            <Button className="w-full" onClick={() => handleNavigation('/create-agents')}>
              Create Agent
            </Button>
          </div>
        </div>

        {/* Clickable area for collapsing when expanded */}
        {!isCollapsed && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <div className="pointer-events-none absolute inset-x-2 inset-y-16 rounded-lg bg-background" />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <Navbar agentName={agentName} />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

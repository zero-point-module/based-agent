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
  // {
  //   title: 'My Account',
  //   description: 'View and update your personal settings',
  //   path: '/account',
  // },
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
    <div className="relative flex h-screen w-full overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10" />
      <div className="absolute -left-32 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-500/20 blur-[120px]" />

      {/* Sidebar */}
      <div
        className={`relative flex ${
          isCollapsed ? 'w-10' : 'w-[320px]'
        } flex-col border-r border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 ease-in-out`}
      >
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
            <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              Hello <span className="italic">Human</span>
            </h1>
          </div>

          <div className="relative z-30 flex flex-col gap-3">
            {menuItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className="group relative flex flex-col gap-1 rounded-md p-3 text-left transition-all hover:bg-white/5"
              >
                <span className="font-medium text-white">{item.title}</span>
                <span className="text-sm text-gray-400">{item.description}</span>
              </button>
            ))}
          </div>

          <div className="relative z-30 mt-auto pt-6">
            <Button
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white transition-all hover:scale-105"
              onClick={() => handleNavigation('/create-agents')}
            >
              <span className="relative z-10">Create Agent</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          </div>
        </div>

        {!isCollapsed && (
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <div className="pointer-events-none absolute inset-x-2 inset-y-16 rounded-lg" />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar agentName={agentName} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

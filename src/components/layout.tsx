import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Agents',
    description: 'Manage and interact with your AI agents',
  },
  {
    title: 'Marketplace',
    description: 'Discover and access trending AI agents',
  },
  {
    title: 'My Account',
    description: 'View and update your personal settings',
  },
];

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-background flex h-screen w-full">
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
            <h1 className="text-2xl font-bold">Hi, Juampi</h1>
          </div>

          <div className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <button
                key={item.title}
                className="relative z-20 flex flex-col gap-1 rounded-md text-left"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-muted-foreground text-sm text-gray-500">
                  {item.description}
                </span>
              </button>
            ))}
          </div>

          <div className="border-t" />

          {/* Recent chats */}
          <div className="flex flex-1"></div>

          <button className="relative z-20 w-full gap-2 border border-red-500">
            Talk with your agent
          </button>
        </div>

        {/* Clickable area for collapsing when expanded */}
        {!isCollapsed && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
          >
            <div className="bg-background pointer-events-none absolute inset-x-2 inset-y-16 rounded-lg" />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">Based Generator</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Juampi Hernandez</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

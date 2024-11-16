import { createBrowserRouter } from 'react-router-dom';
import CreateAgent from '@/components/sections/agents/CreateAgent';
import Layout from '@/components/layout';

export const router = createBrowserRouter([
  {
    element: <Layout agentName="" />,
    children: [
      {
        path: '/',
        element: <div>Home</div>,
      },
      {
        path: '/agents',
        element: <div>Agents</div>,
      },
      {
        path: '/create-agents',
        element: <CreateAgent />,
      },
      {
        path: '/agents/:agentId',
        element: <div>Agent ID</div>,
      },
      {
        path: '/account',
        element: <div>Account</div>,
      },
    ],
  },
]);

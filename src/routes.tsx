import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { HomePage } from './features/HomePage';
import { GenerationList } from './features/generations/GenerationList';
import { EditGeneration } from './features/generations/EditGeneration';

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const generationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations',
  component: GenerationList,
});

const generationsCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/create',
  component: EditGeneration,
});

const generationsEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/$uuid',
  component: EditGeneration,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  generationsRoute,
  generationsCreateRoute,
  generationsEditRoute,
]);

export const router = createRouter({ routeTree });

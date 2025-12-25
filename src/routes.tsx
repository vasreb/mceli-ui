import { useEffect } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { GenerationList } from './features/generation-list/GenerationList';
import { EditGeneration } from './features/generation/EditGeneration';

const rootRoute = createRootRoute({
  component: () => (
    <div>
      <Outlet />
    </div>
  ),
});

function RedirectToGenerations() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: '/generations', replace: true });
  }, [navigate]);

  return null;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: RedirectToGenerations,
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

function RedirectToGenerationData() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });

  useEffect(() => {
    const id = (params as any)?.id;
    if (!id) return;
    navigate({
      to: '/generations/$id/data',
      params: { id },
      replace: true,
    });
  }, [navigate, params]);

  return null;
}

const generationsEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/$id',
  component: RedirectToGenerationData,
});

const generationsEditDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/$id/data',
  component: EditGeneration,
});

const generationsEditAnalyzeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/$id/analyze',
  component: EditGeneration,
});

const generationsEditAnalyzeTabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/generations/$id/analyze/$tab',
  component: EditGeneration,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  generationsRoute,
  generationsCreateRoute,
  generationsEditRoute,
  generationsEditDataRoute,
  generationsEditAnalyzeRoute,
  generationsEditAnalyzeTabRoute,
]);

export const router = createRouter({ routeTree });

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'users',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'settings',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'not-found',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'main-page',
    renderMode: RenderMode.Prerender
  },
];

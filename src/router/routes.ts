import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'applications', component: () => import('@/pages/ApplicationsPage.vue') },
      { path: 'positions', component: () => import('@/pages/PositionsPage.vue') },
      { path: 'companies', component: () => import('@/pages/CompaniesPage.vue') },
      { path: 'recruiters', component: () => import('@/pages/RecruitersPage.vue') },
      { path: 'insights', component: () => import('@/pages/SecondPage.vue') },
      { path: 'training', component: () => import('@/pages/TrainingPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;

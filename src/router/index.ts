import { defineRouter } from '#q-app';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from '@/stores/auth';

const LOCAL_SMOKE_MODE_KEY = 'job-hunt-tracker-local-smoke-mode';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    if (
      typeof window !== 'undefined' &&
      ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
      (window.location.hash.includes('preview=dev') ||
        window.sessionStorage.getItem(LOCAL_SMOKE_MODE_KEY) === 'true')
    ) {
      return true;
    }

    const authStore = useAuthStore();
    await authStore.init();

    if (to.path === '/login') {
      return authStore.isAuthorized ? '/' : true;
    }

    if (authStore.isAuthorized) {
      return true;
    }

    return '/login';
  });

  return Router;
});

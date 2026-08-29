import { defineStore } from 'pinia';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '@/boot/firebase';

type AuthStatus = 'loading' | 'signed-out' | 'authorized' | 'unauthorized' | 'error';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  errorMessage: string;
  initialized: boolean;
  isAdmin: boolean;
}

async function getAuthorization(email: string): Promise<{ authorized: boolean; isAdmin: boolean }> {
  const snapshot = await getDoc(doc(firestore, 'authorizedUsers', email.toLowerCase()));

  if (!snapshot.exists()) {
    return { authorized: false, isAdmin: false };
  }

  return { authorized: true, isAdmin: snapshot.data().isAdmin === true };
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: 'loading',
    user: null,
    errorMessage: '',
    initialized: false,
    isAdmin: false,
  }),

  getters: {
    isAuthorized: (state) => state.status === 'authorized',
  },

  actions: {
    async init() {
      if (this.initialized) {
        return;
      }
      this.initialized = true;

      await new Promise<void>((resolve) => {
        onAuthStateChanged(auth, (user) => {
          void this.handleAuthStateChange(user).finally(resolve);
        });
      });
    },

    async handleAuthStateChange(user: User | null) {
      this.user = user;

      if (!user) {
        this.status = 'signed-out';
        return;
      }

      if (!user.email) {
        this.status = 'unauthorized';
        return;
      }

      try {
        const { authorized, isAdmin } = await getAuthorization(user.email);
        this.isAdmin = isAdmin;
        this.status = authorized ? 'authorized' : 'unauthorized';
      } catch (error) {
        console.error('[auth] allowlist check failed', error);
        this.status = 'error';
        this.errorMessage = 'Could not verify access. Please try again.';
      }
    },

    async signInWithGoogle() {
      this.errorMessage = '';
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (error) {
        console.error('[auth] signInWithPopup failed', error);
        this.errorMessage = 'Google sign-in failed. Please try again.';
      }
    },

    async signInWithEmail(email: string, password: string) {
      this.errorMessage = '';
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error('[auth] signInWithEmailAndPassword failed', error);
        this.errorMessage = 'Invalid email or password.';
      }
    },

    async signOutUser() {
      await signOut(auth);
    },
  },
});

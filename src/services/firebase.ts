import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  type Firestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  increment, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import { 
  getAuth, 
  type Auth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import type { Comment, UserProfile } from '../types';

// Client-side environment configuration
// Users can provide these keys in .env.local without paying anything
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  !firebaseConfig.apiKey.includes('YOUR_')
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.warn('Trending.TT: Firebase initialization error, falling back to local storage:', err);
  }
}

export { app, db, auth };

/**
 * Real-Time Firebase Social Service
 * Supports 100% Free Tier Cloud Sync with fallback to LocalStorage
 */
export const FirebaseSocialService = {
  /**
   * Subscribe to live comments for a given post in real time
   */
  subscribeToComments(
    postId: string, 
    onCommentsUpdate: (comments: Comment[]) => void
  ): Unsubscribe | null {
    if (!db || !isFirebaseConfigured) {
      return null;
    }

    try {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const liveComments: Comment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          liveComments.push({
            id: docSnap.id,
            postId: data.postId,
            authorId: data.authorId,
            authorName: data.authorName || 'Trinbago Citizen',
            authorPhotoURL: data.authorPhotoURL,
            authorLocation: data.authorLocation || 'Port of Spain',
            authorVerified: Boolean(data.authorVerified),
            text: data.text || '',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAtString || new Date().toISOString()),
            upvotes: data.upvotes || 0,
            parentId: data.parentId
          });
        });
        onCommentsUpdate(liveComments);
      }, (error) => {
        console.warn('Firestore live comment subscription notice:', error);
      });
    } catch (err) {
      console.warn('Firestore subscription failed, falling back:', err);
      return null;
    }
  },

  /**
   * Post a new comment to Firestore (Free tier real-time push)
   */
  async addComment(params: {
    postId: string;
    text: string;
    authorName: string;
    authorLocation: string;
    authorId?: string;
    authorPhotoURL?: string;
    authorVerified?: boolean;
    parentId?: string;
  }): Promise<Comment | null> {
    if (!db || !isFirebaseConfigured) return null;

    try {
      const nowIso = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'comments'), {
        postId: params.postId,
        text: params.text,
        authorName: params.authorName,
        authorLocation: params.authorLocation,
        authorId: params.authorId || null,
        authorPhotoURL: params.authorPhotoURL || null,
        authorVerified: Boolean(params.authorVerified),
        parentId: params.parentId || null,
        upvotes: 0,
        createdAt: serverTimestamp(),
        createdAtString: nowIso
      });

      return {
        id: docRef.id,
        postId: params.postId,
        text: params.text,
        authorName: params.authorName,
        authorLocation: params.authorLocation,
        authorId: params.authorId,
        authorPhotoURL: params.authorPhotoURL,
        authorVerified: params.authorVerified,
        parentId: params.parentId,
        createdAt: nowIso,
        upvotes: 0
      };
    } catch (err) {
      console.error('Failed to post comment to Firestore:', err);
      return null;
    }
  },

  /**
   * Increment upvote count for a comment in real time
   */
  async upvoteComment(commentId: string): Promise<void> {
    if (!db || !isFirebaseConfigured) return;
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        upvotes: increment(1)
      });
    } catch (err) {
      console.error('Failed to upvote comment in Firestore:', err);
    }
  },

  /**
   * One-tap Google Sign-In (Free 50k MAU on Firebase Auth)
   */
  async loginWithGoogle(): Promise<UserProfile | null> {
    if (!auth || !isFirebaseConfigured) return null;
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return this.formatUserProfile(cred.user);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      return null;
    }
  },

  /**
   * One-tap Instant Guest/Citizen Login (Zero password friction)
   */
  async loginAsGuest(location = 'Port of Spain'): Promise<UserProfile | null> {
    if (!auth || !isFirebaseConfigured) return null;
    try {
      const cred = await signInAnonymously(auth);
      return {
        uid: cred.user.uid,
        displayName: 'Trinbago Citizen',
        handle: `citizen_${cred.user.uid.slice(0, 5)}`,
        location,
        isVerified: false,
        role: 'citizen',
        joinedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Guest Sign-In error:', err);
      return null;
    }
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    if (!auth || !isFirebaseConfigured) return;
    await signOut(auth);
  },

  /**
   * Listen to active auth state
   */
  onAuthState(callback: (user: UserProfile | null) => void): Unsubscribe | null {
    if (!auth || !isFirebaseConfigured) {
      return null;
    }
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.formatUserProfile(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  formatUserProfile(user: FirebaseUser): UserProfile {
    return {
      uid: user.uid,
      displayName: user.displayName || 'Trinbago Citizen',
      handle: user.email ? user.email.split('@')[0] : `user_${user.uid.slice(0, 5)}`,
      email: user.email || undefined,
      photoURL: user.photoURL || undefined,
      location: 'Port of Spain',
      isVerified: false,
      role: 'citizen',
      joinedAt: new Date().toISOString()
    };
  }
};

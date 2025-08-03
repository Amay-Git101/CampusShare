// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  registrationNumber: string;
  whatsappNumber: string;
  initials: string;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          let fullName = '';
          let registrationNumber = '';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            fullName = userData.fullName;
            registrationNumber = userData.registrationNumber;
          } else {
            fullName = currentUser.displayName || 'New User';
            const regMatch = fullName.match(/\(([^)]+)\)/);
            if (regMatch) {
              registrationNumber = regMatch[1];
              fullName = fullName.replace(/\s*\(([^)]+)\)/, '').trim();
            }
          }
          
          setUser({
            uid: currentUser.uid,
            fullName,
            registrationNumber,
            email: currentUser.email || '',
            whatsappNumber: userDoc.exists() ? userDoc.data().whatsappNumber : '',
            initials: fullName.split(' ').map((n: string) => n[0]).join(''),
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in UserProvider:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
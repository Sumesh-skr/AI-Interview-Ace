
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';

type Role = 'student' | 'hr' | 'admin';

interface UserDetails {
    uid: string;
    fullName: string;
    age: number;
    profession: 'student' | 'working professional' | 'others';
    instituteOrOrganization: string;
    role: Role;
    email: string;
    photoURL?: string;
    createdAt: Timestamp;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    userRole: Role | null;
    userDetails: UserDetails | null;
    register: (email: string, pass: string, role: 'student' | 'hr', details: Omit<UserDetails, 'uid' | 'role' | 'email' | 'createdAt' | 'photoURL'>) => Promise<void>;
    login: (email: string, pass: string, role: 'student' | 'hr' | 'admin') => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const router = useRouter();

    const fetchUserDetails = async (firebaseUser: User) => {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data() as UserDetails;
            setUserRole(userData.role);
            setUserDetails(userData);
            return userData;
        } else {
            setUserRole(null);
            setUserDetails(null);
            return null;
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                await fetchUserDetails(user);
            } else {
                setUser(null);
                setUserRole(null);
                setUserDetails(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const register = async (email: string, pass: string, role: 'student' | 'hr', details: Omit<UserDetails, 'uid' | 'role' | 'email' | 'createdAt' | 'photoURL'>) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            role: role,
            ...details,
            createdAt: new Date(),
        });
    };

    const login = async (email: string, pass: string, role: Role) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        
        const userData = await fetchUserDetails(userCredential.user);

        if (!userData) {
            await signOut(auth);
            throw new FirebaseError('auth/user-not-found', 'User data not found in database.');
        }

        if (userData.role !== role) {
             await signOut(auth);
             if (role === 'admin') {
                throw new FirebaseError('auth/invalid-credential', `You do not have admin privileges.`);
             }
             throw new FirebaseError('auth/invalid-credential', `This email is registered as a ${userData.role}. Please log in with the correct role.`);
        }
    };
    
    const logout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const value = {
        user,
        loading,
        userRole,
        userDetails,
        register,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

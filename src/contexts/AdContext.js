import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '@/utils/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

const AdContext = createContext({
  shouldShowAds: true,
  isLoading: true,
  user: null,
  refreshAdStatus: () => {}
});

// List of users who should not see ads (admin emails, premium users, etc.)
const NO_ADS_USERS = [
  'gaurav1000m@gmail.com',
  // Add more emails here as needed
];

export function AdProvider({ children }) {
  const [shouldShowAds, setShouldShowAds] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAdStatus = useCallback(async (firebaseUser) => {
    try {
      setIsLoading(true);
      
      if (!firebaseUser) {
        // No user logged in - show ads
        setShouldShowAds(true);
        setUser(null);
        return;
      }

      const userEmail = firebaseUser.email;
      setUser(firebaseUser);

      // Check if user is in no-ads list
      const isNoAdsUser = NO_ADS_USERS.includes(userEmail?.toLowerCase());
      
      // Also check via backend API for more dynamic control
      let apiSaysNoAds = false;
      try {
        const response = await fetch('/api/user/ads-status?userId=' + firebaseUser.uid);
        if (response.ok) {
          const data = await response.json();
          apiSaysNoAds = !data.showAds;
        }
      } catch {
        // console.log('API check failed, using local list');
      }

      // Hide ads if user is in no-ads list OR API says so
      setShouldShowAds(!isNoAdsUser && !apiSaysNoAds);
      
    } catch (error) {
      console.error('Error checking ad status:', error);
      setShouldShowAds(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      checkAdStatus(firebaseUser);
    });

    return () => unsubscribe();
  }, [checkAdStatus]);

  const refreshAdStatus = useCallback(() => {
    checkAdStatus();
  }, [checkAdStatus]);

  return (
    <AdContext.Provider value={{ 
      shouldShowAds, 
      isLoading, 
      user,
      refreshAdStatus 
    }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

// Helper hook for components that need to conditionally render ads
export function useShouldShowAds() {
  const { shouldShowAds, isLoading } = useAds();
  return { shouldShowAds: shouldShowAds && !isLoading, isLoading };
}

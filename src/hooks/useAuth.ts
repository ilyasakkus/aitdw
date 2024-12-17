import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase'; // veya kendi auth servisiniz

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Kullanıcı bilgilerini ve admin durumunu kontrol et
        setUser({
          uid: user.uid,
          email: user.email,
          isAdmin: user.customClaims?.admin || false,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isLoading };
}; 
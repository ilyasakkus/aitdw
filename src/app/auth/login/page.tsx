'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await signIn(
        formData.get('email') as string,
        formData.get('password') as string
      );
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      // Hata mesajını göster
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Giriş Yap</button>
    </form>
  );
}

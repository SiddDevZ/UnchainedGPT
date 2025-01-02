"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const DiscordCallback = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = fragment.get('access_token');

      if (accessToken) {
        try {
          // Fetch user data from Discord
          const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data from Discord');
          }

          const userData = await userResponse.json();

          // Send user data to your backend
          const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discordauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (backendResponse.ok) {
            const backendData = await backendResponse.json();
            if (backendData.token) {
              Cookies.set("token", backendData.token, {
                expires: 365,
                sameSite: "None",
                secure: true,
                path: '/',
              });
              router.push('/chat');
            } else {
              throw new Error('No token received from backend');
            }
          } else {
            throw new Error('Backend authentication failed');
          }
        } catch (err) {
          console.error('Error during authentication: ', err);
          setError(err.message);
        }
      } else {
        setError('No access token found in the URL');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return <div className='text-black'>Error: {error}</div>;
  }

  return <div className='text-black'>Processing Discord login...</div>;
};

export default DiscordCallback;
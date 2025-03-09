import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Head from 'next/head';

const metadata = {
  title: 'UnchainedGPT',
  description: 'AI-powered platform by Team Unchained',
  icons: {
    icon: '/unchained.png',
    shortcut: '/unchained.png',
    apple: '/unchained.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.icons.icon} />
      </head>
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
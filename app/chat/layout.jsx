import { Analytics } from '@vercel/analytics/react';

export default function ChatLayout({ children }) {
    return <>
      {children}
      <Analytics />
    </>;
  }
  
  export const dynamicParams = true;
import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Did you make it? anon;)',
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/main.png`,
    aspectRatio: '1.91:1',
  },

  postUrl: `${NEXT_PUBLIC_URL}/api/sheets`,
});

export const metadata: Metadata = {
  metadataBase: new URL(NEXT_PUBLIC_URL),
  title: 'My-Result-Frame',
  description: 'LFG',
  openGraph: {
    title: 'My-Result-Frame',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/main.png`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>My Result Frame</h1>
    </>
  );
}

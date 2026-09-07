declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  type PwaOptions = {
    dest?: string;
    disable?: boolean;
    [key: string]: unknown;
  };

  const withPWA: (options?: PwaOptions) => (config: NextConfig) => NextConfig;

  export default withPWA;
}

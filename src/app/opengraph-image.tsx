import { ImageResponse } from 'next/og';

export const alt = 'KartaTuju | Sistem Informasi Organisasi dan Transparansi Warga';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'nodejs';

// Assets in `public` are served by Vercel but are not guaranteed to exist in
// the serverless function filesystem. Supplying an absolute public URL lets
// ImageResponse fetch the same logo without making every Server Component
// render depend on `process.cwd()/public/logo.png`.
const logoSrc = 'https://kartatuju.vercel.app/logo.png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #071a33 0%, #0e3d74 54%, #0a7b94 100%)',
          color: 'white',
          display: 'flex',
          height: '100%',
          padding: '58px 72px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '999px',
            display: 'flex',
            height: 360,
            marginRight: 60,
            overflow: 'hidden',
            padding: 18,
            width: 360,
          }}
        >
          <img alt="Logo Karang Taruna RT 07" height="324" src={logoSrc} style={{ height: 324, objectFit: 'contain', width: 324 }} width="324" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 610 }}>
          <div style={{ color: '#93e5f5', display: 'flex', fontSize: 24, fontWeight: 700, letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase' }}>
            Portal Organisasi Pemuda
          </div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, letterSpacing: -3, lineHeight: 1.05 }}>KartaTuju</div>
          <div style={{ display: 'flex', fontSize: 30, lineHeight: 1.35, marginTop: 20, opacity: 0.92 }}>
            Sistem Informasi Organisasi & Transparansi Warga
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.14)',
              alignSelf: 'flex-start',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
              display: 'flex',
              fontSize: 21,
              marginTop: 34,
              padding: '11px 20px',
              width: 'auto',
            }}
          >
            RT 07 / RW 07 · Jatijajar II, Depok
          </div>
        </div>

        <div style={{ background: '#ff3131', borderRadius: 999, bottom: -120, height: 270, position: 'absolute', right: -78, width: 270 }} />
      </div>
    ),
    size,
  );
}

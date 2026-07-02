import { profile } from '../data/profile';

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-grid bg-bg/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-[11px] text-dim md:flex-row md:items-center md:px-8">
        <p>
          <span className="text-neon">[EOF]</span> © {new Date().getFullYear()} {profile.name} ·
          built with React 18 + R3F · rendered on demand
        </p>
        <p className="md:ml-auto">
          exit code <span className="text-neon">0</span> · uptime: your entire scroll
        </p>
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { Toaster } from 'sonner';
import { PipelineCanvas } from './components/three/PipelineCanvas';
import { BootSequence } from './components/BootSequence';
import { NavBar } from './components/NavBar';
import { Hero } from './components/hero/Hero';
import { About } from './components/sections/About';
import { Stack } from './components/sections/Stack';
import { Projects } from './components/sections/Projects';
import { Log } from './components/sections/Log';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { CvModal } from './components/CvModal';

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);

  return (
    <>
      <BootSequence />
      <PipelineCanvas />
      <NavBar onOpenPalette={() => setPaletteOpen(true)} />

      <main className="relative z-10">
        <Hero />
        <About />
        <Stack />
        <Projects />
        <Log />
        <Contact />
      </main>

      <Footer />
      <div className="crt-overlay" />

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} onViewCv={() => setCvOpen(true)} />
      <CvModal open={cvOpen} onClose={() => setCvOpen(false)} />
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgb(10 15 13 / 0.96)',
            border: '1px solid rgb(0 255 156 / 0.35)',
            color: 'rgb(214 234 224)',
            borderRadius: 0,
            fontSize: '12px',
          },
        }}
      />
    </>
  );
}

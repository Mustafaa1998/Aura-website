import { AmbientPointer } from "@/components/AmbientPointer";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PersistentProductStory } from "@/components/PersistentProductStory";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SoundToggle } from "@/components/SoundToggle";

export default function Home() {
  return (
    <main id="top">
      <SmoothScroll />
      <AmbientPointer />
      <Nav />
      <PersistentProductStory />
      <SoundToggle />
      <Footer />
    </main>
  );
}

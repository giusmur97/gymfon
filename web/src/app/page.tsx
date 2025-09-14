import ParallaxHero from "@/components/ParallaxHero";
import WizardTeaser from "@/components/WizardTeaser";
import ServicesMatrix from "@/components/ServicesMatrix";
import AppPreview from "@/components/AppPreview";
import Testimonials from "@/components/Testimonials";
import RevealOnScroll from "@/components/ux/RevealOnScroll";
import AnimatedGradientText from "@/components/ux/AnimatedGradientText";
import ScrollParallax from "@/components/ux/ScrollParallax";

export default function Home() {
  return (
    <div className="space-y-12">
      <ParallaxHero />

      <RevealOnScroll>
        <WizardTeaser />
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <h2 className="heading-display text-2xl md:text-3xl text-foreground">
            <AnimatedGradientText>Cosa offriamo</AnimatedGradientText>
          </h2>
          <p className="mt-2 text-muted max-w-3xl">
            Allenamenti e piani alimentari su misura, seguiti da professionisti con un approccio sicuro e progressivo. Puoi scegliere coaching online, in presenza o ibrido.
          </p>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <ScrollParallax>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Miglioramento estetico", "Definizione e ricomposizione"],
              ["Dimagrimento", "Perdita di grasso sostenibile"],
              ["Forza", "Progressi misurabili ogni mese"],
              ["Performance", "Atletica e funzionale"],
            ].map(([t, s]) => (
              <div key={t} className="rounded-2xl border border-border bg-surface p-5 card-3d">
                <p className="text-sm text-muted">{t}</p>
                <p className="mt-1 font-semibold text-foreground">{s}</p>
              </div>
            ))}
          </section>
        </ScrollParallax>
      </RevealOnScroll>

      <RevealOnScroll>
        <ScrollParallax>
          <ServicesMatrix />
        </ScrollParallax>
      </RevealOnScroll>

      <RevealOnScroll>
        <ScrollParallax>
          <AppPreview />
        </ScrollParallax>
      </RevealOnScroll>

      <RevealOnScroll>
        <Testimonials />
      </RevealOnScroll>
    </div>
  );
}

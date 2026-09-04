'use client';
import React from 'react';
import { useApp } from '@/context/AppContext';
import { useIsRTL } from '@/hooks/use-is-rtl';

export default function AcknowledgementsSection() {
  const { t } = useApp();
  const isRTL = useIsRTL();

  // Markdown-style list with links and attributions
  const acknowledgementsMarkdown = `
[Capítulo 1](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_01_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 2](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_02_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 3](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_03_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 4](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_04_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Milonga](https://www.archive.org/download/20poemas_2005_librivox/20poemastranvia_07_girondo_128kb.mp3) from [20 Poemas Para Ser Leídos En El Tranvía](https://librivox.org/20-poemas-para-ser-leidos-en-el-tranvia-by-oliverio-girondo/) read by [InvertiseFinabat](https://librivox.org/reader/13517)

[Las secciones españolas de Señoras y Forestal](https://www.archive.org/download/viajeaamerica1_2203_librivox/viajeaamerica1_15_puigyvalls_128kb.mp3) from [Viaje a América (Tomo 1 de 2)](https://librivox.org/viaje-a-america-tomo-1-by-rafael-puig-y-valls/) read by [MiltonFMH](https://librivox.org/reader/16442)

[Primera Noche](https://www.archive.org/download/nochesblancas_2509_librivox/nochesblancas_01_dostoyevsky_128kb.mp3) from [Las noches blancas](https://librivox.org/las-noches-blancas-by-fyodor-dostoyevsky/) read by [Victor Villarraza](https://librivox.org/reader/8882)

[Capítulo 5](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_05_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 6](https://www.archive.org/download/biblereinavalera02exodo_1611_librivox/exodo_06_rva_128kb.mp3) from [Bible (Reina Valera) 02: Éxodo](https://librivox.org/bible-reina-valera-02-exodo-by-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Un enamorado y un loco](https://www.archive.org/download/milyunfantasmasvol2_2202_librivox/milyunfantasmasvol2_05_dumas_128kb.mp3) from [Los mil y un fantasmas, vol. 2](https://librivox.org/los-mil-y-un-fantasmas-vol-2-by-alexandre-dumas/) read by [MiltonFMH](https://librivox.org/reader/16442)

[Capítulo 01](https://www.archive.org/download/numeros_rva_2002_librivox/numeros_01_rva_128kb.mp3) from [Bible (Reina Valera) 04: Números](https://librivox.org/numeros-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 02](https://www.archive.org/download/numeros_rva_2002_librivox/numeros_02_rva_128kb.mp3) from [Bible (Reina Valera) 04: Números](https://librivox.org/numeros-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 6](https://www.archive.org/download/jueces_reinavalera_1704_librivox/jueces_06_rva_128kb.mp3) from [Bible (Reina Valera) 07: Jueces](https://librivox.org/jueces-de-la-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

[Capítulo 7](https://www.archive.org/download/jueces_reinavalera_1704_librivox/jueces_07_rva_128kb.mp3) from [Bible (Reina Valera) 07: Jueces](https://librivox.org/jueces-de-la-reina-valera/) read by [Joyfull](https://librivox.org/reader/9972)

Photo by [Edgar Mosqueda Camacho](https://www.pexels.com/@edgar-mosqueda-camacho-544076702/) from [Pexels](https://www.pexels.com/photo/illuminated-church-in-guadalajara-in-mexico-at-night-19118030/)

Photo by [Edgar Mosqueda Camacho](https://www.pexels.com/@edgar-mosqueda-camacho-544076702/) from [Pexels](https://www.pexels.com/photo/27304775/)

[Success 03](https://freesound.org/s/322930/) by [rhodesmas](https://freesound.org/people/rhodesmas/) -- License: [Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

[Failure 01](https://freesound.org/s/342756/) by [rhodesmas](https://freesound.org/people/rhodesmas/) -- License: [Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)

[Fanfare 2 - Rpg](https://freesound.org/s/580310/) by [colorsCrimsonTears](https://freesound.org/people/colorsCrimsonTears/) -- License: [Creative Commons 0](http://creativecommons.org/publicdomain/zero/1.0/)

[Chronicle Button](https://codepen.io/Haaguitos/pen/OJrVZdJ) by [Haaguitos](https://codepen.io/Haaguitos)

[Button hover effect](https://codepen.io/thebabydino/pen/PoxVZWg) by [Ana Tudor](https://codepen.io/thebabydino)

[Electric Border](https://codepen.io/BalintFerenczy/pen/KwdoyEN) by [Bálint Ferenczy](https://codepen.io/BalintFerenczy)

[Electric Border (iOS Safe)](https://codepen.io/BalintFerenczy/pen/yyYErXa) by [Bálint Ferenczy](https://codepen.io/BalintFerenczy)

[Toggle Vault](https://www.scrollxui.dev/docs/components/toggle-vault) by [ScrollX UI](https://www.scrollxui.dev/)

[Glowing Effect](https://ui.aceternity.com/components/glowing-effect) by [Aceternity UI](https://ui.aceternity.com/)

[すりガラスなプロフィールカード](https://codepen.io/ash_creator/pen/zYaPZLB) by [あしざわ - Webクリエイター](https://codepen.io/ash_creator)

[Glass Cards](https://codepen.io/RAFA3L/pen/NPKeYMo) by [Rafa](https://codepen.io/RAFA3L)

[Design Wormhole](https://codepen.io/RAFA3L/pen/WbedLaw) by [Rafa](https://codepen.io/RAFA3L)

[Accent Shard (On Hover)](https://codepen.io/Hyperplexed/pen/qBMYVoq) by [Hyperplexed](https://codepen.io/Hyperplexed)

[Custom Checkbox](https://21st.dev/Edil-ozi/custom-checkbox/default) by [Edil Ozi](https://21st.dev/Edil-ozi)

[チェックしないと押せないボタン](https://codepen.io/ash_creator/pen/JjZReNm) by [あしざわ - Webクリエイター](https://codepen.io/ash_creator)

[radix-ui](https://www.npmjs.com/package/radix-ui)

[Pagination](https://codepen.io/-we-code-/pen/oNRGgYQ) by [we-code](https://codepen.io/-we-code-)

[Pagination - with Sliding Animation](https://codepen.io/-we-code-/pen/ZENXgLe) by [we-code](https://codepen.io/-we-code-)

[Text Rotate](https://www.fancycomponents.dev/docs/components/text/text-rotate) by [Fancy Components](https://www.fancycomponents.dev/)

[Flip Words](https://ui.aceternity.com/components/flip-words) by [Aceternity UI](https://ui.aceternity.com/)

[Spade](https://phosphoricons.com/?q=Spade) by [Phosphor Icons](https://phosphoricons.com)

[Ace of Spades](https://commons.wikimedia.org/wiki/File:Ace_of_spades.svg)

telescope from [AnimateIcons](https://www.animateicons.in/)

[framer-motion](https://www.npmjs.com/package/framer-motion)

[Lucide React](https://www.npmjs.com/package/lucide-react)

[Next.js](https://nextjs.org/)

[Perplexity](https://www.perplexity.ai/)

[Firebase Studio](https://firebase.studio/)

[Google AI Studio](https://aistudio.google.com/)

[Google Gemini](https://gemini.google.com/)
`;

  // Function to parse markdown [label](url) syntax
  function renderEntry(entry: string) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(entry)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++} className="text-[hsl(var(--muted-foreground))]">
            {entry.slice(lastIndex, match.index)}
          </span>
        );
      }

      // The hyperlink (forced to LTR)
      parts.push(
        <a
          key={key++}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[hsl(var(--foreground)/0.9)] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
          style={{ direction: 'ltr' }}
        >
          {match[1]}
        </a>
      );
      lastIndex = regex.lastIndex;
    }

    // Remaining text after final match
    if (lastIndex < entry.length) {
      parts.push(
        <span key={key++} className="text-[hsl(var(--muted-foreground))]">
          {entry.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  }

  const entries = acknowledgementsMarkdown
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section
      id="acknowledgements-section"
      className="w-full py-6 md:py-8 bg-background transition"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[1296px] mx-auto px-6 md:px-10 w-full flex flex-col items-center justify-center text-center">
        <div className="mb-12">
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))]">
            {t('acknowledgements')}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            {t('acknowledgementDescription')}
          </p>
        </div>

        <div
          className="max-w-[1296px] w-full flex flex-col items-center justify-center"
          style={{
            textAlign: 'center',
            direction: isRTL ? 'rtl' : 'ltr',
          }}
        >
          <ul
            className="w-full flex flex-col items-center justify-center"
            style={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
              lineHeight: 1.75,
            }}
          >
            {entries.map((entry, idx) => (
              <li
                key={idx}
                className="mb-4 last:mb-0 text-[1rem] text-[hsl(var(--muted-foreground))]"
                style={{
                  direction: 'ltr',
                  textAlign: 'center',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                {renderEntry(entry)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const WORD = "COMPACT";
const LETTERS = WORD.split("");

const DURATION = 0.15;
const STAGGER = 0.05;
const LAYER_SPAN = DURATION + STAGGER * (LETTERS.length - 1);

/* Elemen hero lain dianimasikan lebih dulu (0.8s + stagger 0.1s), jadi judul
   baru mulai setelah semuanya selesai tampil. */
const START_DELAY = 1;

/**
 * Judul "COMPACT" berlapis: biru, oranye, lalu tinta (hitam/putih).
 *
 * Ketiga lapisan ditumpuk di sel grid yang sama. Setiap huruf berada di dalam
 * kotak overflow-hidden sehingga hanya terlihat saat masuk ke area judul
 * (efek clipping mask). Animasi sepenuhnya CSS, jadi tetap jalan tanpa JS.
 */
export function HeroTitle({ className = "" }: { className?: string }) {
  /* Tiap lapisan mulai saat lapisan sebelumnya hampir selesai, dengan
     tumpang-tindih yang lebih pendek. */
  const orangeOffset = LAYER_SPAN * 0.15;
  const inkOffset = LAYER_SPAN * 0.25;
  const fadeDelay = START_DELAY + inkOffset + LAYER_SPAN;

  const layers = [
    { key: "blue", offset: 0, fade: true },
    { key: "orange", offset: orangeOffset, fade: true },
    { key: "ink", offset: inkOffset, fade: false }
  ] as const;

  return (
    <h1 className={`hero-title ${className}`}>
      <span className="sr-only">{WORD}</span>
      <span aria-hidden="true" className="hero-title__stack">
        {layers.map((layer) => (
          <span
            key={layer.key}
            className={`hero-title__layer hero-title__layer--${layer.key}`}
            style={layer.fade ? { animationDelay: `${fadeDelay}s` } : undefined}
          >
            {LETTERS.map((char, index) => (
              <span key={index} className="hero-title__letter">
                <span
                  className={`hero-title__letter-inner hero-title__letter-inner--${layer.key}`}
                  style={{ animationDelay: `${START_DELAY + layer.offset + index * STAGGER}s` }}
                >
                  {char}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}

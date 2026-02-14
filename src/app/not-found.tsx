const messages = [
  "Game, set, mismatch!",
  "You hit it out — no page here!",
  "Net error! Try again?",
  "Let's rally back to the homepage.",
  "Ace not found.",
  "New balls please! This page is missing.",
];

export default function NotFound() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#141B2D] px-4 text-center relative overflow-hidden">
      {/* Spinning tennis balls */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 animate-[spin_20s_linear_infinite]">
        🎾
      </div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-[spin_25s_linear_infinite_reverse]">
        🎾
      </div>

      <div className="relative z-10">
        {/* Character */}
        <div className="mb-2 animate-[bounceIn_0.8s_ease-out]">
          <picture>
            <source
              srcSet="https://joechamdani.com/images/404/waakk.webp"
              type="image/webp"
            />
            <img
              src="https://joechamdani.com/images/404/waakk.PNG"
              alt="Lost character"
              className="mx-auto w-48 drop-shadow-2xl object-contain md:w-64"
            />
          </picture>
        </div>

        <div className="mb-6 animate-[scaleIn_0.6s_ease-out_0.3s_both]">
          <h1 className="text-9xl font-[var(--font-heading)] font-extrabold text-slate-100 leading-none md:text-[12rem]">
            404
          </h1>
        </div>

        <h2 className="text-2xl font-[var(--font-heading)] font-bold text-slate-100 mb-4 animate-[fadeUp_0.5s_ease-out_0.2s_both] md:text-3xl">
          {randomMessage}
        </h2>

        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto font-mono animate-[fadeUp_0.5s_ease-out_0.3s_both]">
          This court doesn&apos;t exist. Let&apos;s get you back in play.
        </p>

        <div className="animate-[fadeUp_0.5s_ease-out_0.4s_both]">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:gap-3"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Status Page
          </a>
        </div>

        {/* Bouncing tennis ball */}
        <div className="text-6xl mt-12 animate-bounce">🎾</div>

        <div className="mt-8 text-slate-500 text-sm font-mono animate-[fadeUp_0.5s_ease-out_0.6s_both]">
          Error Code: 404 | Page Not Found
        </div>
      </div>
    </div>
  );
}

/**
 * Shared illustration library for the static-electricity lab.
 * Every scene is drawn by hand with its own gradients, shadows and glow so the
 * artwork carries the same visual language as the rest of the page.
 */

type ArtProps = { className?: string; title?: string };

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function ChargeDot({ x, y, sign, r = 6 }: { x: number; y: number; sign: "+" | "-"; r?: number }) {
  const color = sign === "+" ? "#e05a45" : "#1f8fa6";
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.9} fill={color} opacity="0.16" />
      <circle cx={x} cy={y} r={r} fill={color} />
      <line x1={x - r * 0.45} y1={y} x2={x + r * 0.45} y2={y} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      {sign === "+" && (
        <line x1={x} y1={y - r * 0.45} x2={x} y2={y + r * 0.45} stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </g>
  );
}

function FieldArc({ d, color = "#e9a22b", width = 1.6 }: { d: string; color?: string; width?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="5 6" opacity="0.75" className="anim-dash" />;
}

function Table({ y = 132, w = 320 }: { y?: number; w?: number }) {
  return (
    <g>
      <rect x="0" y={y} width={w} height={160 - y} fill="url(#tableGrad)" />
      <line x1="0" y1={y} x2={w} y2={y} stroke="#c4703f" strokeOpacity="0.45" strokeWidth="1.5" />
      {[0.2, 0.45, 0.7, 0.9].map((f) => (
        <line key={f} x1={w * f - 30} y1={y + 6} x2={w * f + 26} y2={y + 6} stroke="#c4703f" strokeOpacity="0.18" strokeWidth="2" strokeLinecap="round" />
      ))}
    </g>
  );
}

function BaseDefs() {
  return (
    <>
      <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f6ecd9" />
        <stop offset="100%" stopColor="#e6d3b3" />
      </linearGradient>
      <linearGradient id="paperGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ece6d8" />
      </linearGradient>
      <linearGradient id="combGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3fb08a" />
        <stop offset="45%" stopColor="#1e7f63" />
        <stop offset="100%" stopColor="#0d4a3a" />
      </linearGradient>
      <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f2f7f5" />
        <stop offset="35%" stopColor="#b9c9c3" />
        <stop offset="70%" stopColor="#8ea39b" />
        <stop offset="100%" stopColor="#5e7268" />
      </linearGradient>
      <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="45%" stopColor="#d7ece4" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#9fd3c3" stopOpacity="0.55" />
      </linearGradient>
      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bfeaf1" />
        <stop offset="50%" stopColor="#7fcbd3" />
        <stop offset="100%" stopColor="#4fb0bd" />
      </linearGradient>
      <radialGradient id="balloonGrad" cx="35%" cy="30%">
        <stop offset="0%" stopColor="#f0796b" />
        <stop offset="55%" stopColor="#c6493f" />
        <stop offset="100%" stopColor="#8d2f2b" />
      </radialGradient>
      <linearGradient id="rodGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7fcbd3" />
        <stop offset="55%" stopColor="#2e9aa6" />
        <stop offset="100%" stopColor="#175b66" />
      </linearGradient>
      <radialGradient id="sparkGlow">
        <stop offset="0%" stopColor="#fff3cf" stopOpacity="0.95" />
        <stop offset="45%" stopColor="#f2c14e" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#f2c14e" stopOpacity="0" />
      </radialGradient>
      <filter id="softDrop" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.4" floodColor="#20342c" floodOpacity="0.3" />
      </filter>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* experiment scenes                                                   */
/* ------------------------------------------------------------------ */

export function ExperimentArt({ id, className, title }: ArtProps & { id: string }) {
  return (
    <svg viewBox="0 0 320 160" className={className} role="img" aria-label={title ?? "رسم توضيحي للتجربة"}>
      <title>{title ?? "رسم توضيحي للتجربة"}</title>
      <defs>
        <BaseDefs />
      </defs>
      <rect width="320" height="160" rx="16" fill="#f7fbf7" />
      {id === "comb" && <CombScene />}
      {id === "water" && <WaterScene />}
      {id === "balloon" && <BalloonScene />}
      {id === "can" && <CanScene />}
      {id === "jar" && <JarScene />}
      {id === "pepper" && <PepperScene />}
      {id === "spark" && <SparkScene />}
    </svg>
  );
}

function CombScene() {
  const bits = [
    { x: 74, y: 118, rot: -14, air: false },
    { x: 118, y: 92, rot: 22, air: true },
    { x: 158, y: 74, rot: -28, air: true },
    { x: 200, y: 96, rot: 12, air: true },
    { x: 244, y: 120, rot: -6, air: false },
  ];
  return (
    <g>
      <Table y={134} />
      {/* comb */}
      <g filter="url(#softDrop)">
        <rect x="52" y="18" width="216" height="20" rx="9" fill="url(#combGrad)" />
        <rect x="58" y="21" width="200" height="5" rx="2.5" fill="#ffffff" opacity="0.28" />
        {Array.from({ length: 20 }).map((_, i) => (
          <path key={i} d={`M${60 + i * 10.6} 38 h6 l-1.4 24 h-3.2 z`} fill="url(#combGrad)" />
        ))}
      </g>
      {Array.from({ length: 7 }).map((_, i) => (
        <ChargeDot key={i} x={72 + i * 30} y={12} sign="-" r={4.6} />
      ))}
      {/* field lines */}
      <FieldArc d="M150 66 C 146 80, 150 88, 156 96" />
      <FieldArc d="M196 66 C 200 80, 200 86, 198 92" />
      {/* paper bits, polarised */}
      {bits.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} className={b.air ? "anim-float" : undefined} style={{ animationDelay: `${i * 0.5}s` }}>
          <rect x="-11" y="-7" width="22" height="14" rx="2" fill="url(#paperGrad)" stroke="#c9b58f" strokeWidth="0.9" />
          <line x1="-6" y1="-3" x2="6" y2="-3" stroke="#d8c9a8" strokeWidth="0.9" />
          <ChargeDot x={-6} y={3} sign="+" r={3.1} />
          <ChargeDot x={6} y={3} sign="-" r={3.1} />
        </g>
      ))}
      <text x="16" y="152" fontSize="9.5" fill="#5e7268">
        استقطاب: الشحنات المخالفة تقترب من المشط
      </text>
    </g>
  );
}

function WaterScene() {
  return (
    <g>
      <rect x="0" y="0" width="320" height="160" fill="#f2f8f8" />
      {/* faucet */}
      <g filter="url(#softDrop)">
        <rect x="24" y="16" width="18" height="46" rx="6" fill="url(#metalGrad)" />
        <path d="M24 30 h56 a12 12 0 0 1 12 12 v10 h-16 v-6 a4 4 0 0 0 -4 -4 H24 z" fill="url(#metalGrad)" />
        <circle cx="33" cy="12" r="9" fill="url(#metalGrad)" />
        <rect x="72" y="50" width="22" height="7" rx="3" fill="#8ea39b" />
      </g>
      {/* stream bending toward the rod */}
      <path d="M83 58 C 83 92, 104 108, 122 146" stroke="url(#waterGrad)" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M83 60 C 83 92, 102 106, 118 142" stroke="#ffffff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.6" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={112 + i * 9} cy={122 + i * 11} r={2.6 - i * 0.4} fill="#7fcbd3" opacity="0.85" />
      ))}
      {/* basin */}
      <ellipse cx="128" cy="150" rx="70" ry="9" fill="#d7ece4" />
      {/* charged rod */}
      <g filter="url(#softDrop)" transform="rotate(-16 232 84)">
        <rect x="176" y="74" width="112" height="19" rx="9.5" fill="url(#rodGrad)" />
        <rect x="182" y="77" width="98" height="4.5" rx="2.2" fill="#ffffff" opacity="0.3" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <ChargeDot key={i} x={188 + i * 22} y={62 - i * 5} sign="-" r={4.4} />
      ))}
      <FieldArc d="M172 84 C 150 92, 132 104, 120 122" color="#2e9aa6" />
      <FieldArc d="M178 96 C 158 104, 142 116, 132 134" color="#2e9aa6" />
      <text x="196" y="150" fontSize="9.5" fill="#5e7268">
        جزيئات الماء القطبية تدور فتنحرف
      </text>
    </g>
  );
}

function BalloonScene() {
  return (
    <g>
      <rect x="0" y="0" width="320" height="160" fill="#fbf7f2" />
      {/* wall */}
      <rect x="236" y="0" width="84" height="160" fill="#eee6da" />
      <line x1="236" y1="0" x2="236" y2="160" stroke="#d9cbb8" strokeWidth="2" />
      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1="240" y1={14 + i * 26} x2="318" y2={14 + i * 26} stroke="#e2d7c6" strokeWidth="1" />
      ))}
      {/* head silhouette */}
      <path d="M46 160 C 46 116, 74 96, 100 100 C 122 104, 130 126, 128 160 z" fill="#c99a76" opacity="0.55" />
      {/* hair strands standing up toward the balloon */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M${58 + i * 13} ${104 - i * 1.5} q ${16 + i * 4} ${-30 - i * 3} ${44 + i * 5} ${-34 - i * 2}`}
          stroke="#4a3a2f"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}
      {/* balloon on the wall */}
      <g filter="url(#softDrop)">
        <ellipse cx="196" cy="62" rx="40" ry="47" fill="url(#balloonGrad)" />
        <ellipse cx="180" cy="44" rx="12" ry="16" fill="#ffffff" opacity="0.3" transform="rotate(-24 180 44)" />
        <path d="M196 109 l-7 12 h14 z" fill="#8d2f2b" />
        <path d="M196 121 q 14 16 4 34" stroke="#8d2f2b" strokeWidth="1.8" fill="none" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <ChargeDot key={i} x={168 + (i % 2) * 42} y={40 + Math.floor(i / 2) * 40} sign="-" r={5} />
      ))}
      {[0, 1, 2].map((i) => (
        <ChargeDot key={i} x={248} y={44 + i * 26} sign="+" r={4.6} />
      ))}
      <FieldArc d="M236 62 C 226 62, 220 62, 210 62" color="#e05a45" />
      <text x="16" y="152" fontSize="9.5" fill="#5e7268">
        الشعر يتنافر… والجدار يُستقطب فيلتصق البالون
      </text>
    </g>
  );
}

function CanScene() {
  return (
    <g>
      <Table y={126} />
      {/* motion trails */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${58 - i * 12} ${96 + i * 4} h18`} stroke="#2fa07c" strokeWidth="2.4" strokeLinecap="round" opacity={0.5 - i * 0.13} />
      ))}
      {/* can */}
      <g filter="url(#softDrop)">
        <rect x="86" y="60" width="58" height="66" rx="12" fill="url(#metalGrad)" />
        <ellipse cx="115" cy="62" rx="29" ry="9" fill="#dfe9e4" stroke="#9fb4ac" />
        <ellipse cx="115" cy="62" rx="20" ry="5.6" fill="#b9c9c3" />
        <rect x="86" y="82" width="58" height="20" fill="#c6493f" opacity="0.85" />
        <rect x="86" y="82" width="58" height="4" fill="#ffffff" opacity="0.25" />
        <rect x="93" y="62" width="6" height="64" fill="#ffffff" opacity="0.35" />
      </g>
      {/* induced charges */}
      {[0, 1, 2].map((i) => (
        <ChargeDot key={`p${i}`} x={140} y={74 + i * 18} sign="+" r={4.6} />
      ))}
      {[0, 1, 2].map((i) => (
        <ChargeDot key={`n${i}`} x={92} y={74 + i * 18} sign="-" r={4.6} />
      ))}
      {/* charged balloon */}
      <g filter="url(#softDrop)">
        <ellipse cx="238" cy="82" rx="30" ry="35" fill="url(#balloonGrad)" />
        <ellipse cx="227" cy="68" rx="8" ry="11" fill="#fff" opacity="0.28" transform="rotate(-22 227 68)" />
        <path d="M238 117 l-5 9 h10 z" fill="#8d2f2b" />
      </g>
      <FieldArc d="M206 82 C 186 82, 168 82, 150 82" />
      <path d="M170 118 h30" stroke="#e9a22b" strokeWidth="2.6" strokeLinecap="round" />
      <polygon points="204,118 194,113 194,123" fill="#e9a22b" />
      <text x="16" y="152" fontSize="9.5" fill="#5e7268">
        الناقل المتعادل يُستقطب فيتدحرج نحو البالون
      </text>
    </g>
  );
}

function JarScene() {
  return (
    <g>
      <rect width="320" height="160" fill="#f4f9f6" />
      <Table y={140} />
      {/* jar */}
      <g filter="url(#softDrop)">
        <path d="M116 46 h96 v82 a12 12 0 0 1 -12 12 h-72 a12 12 0 0 1 -12 -12 z" fill="url(#glassGrad)" stroke="#8fd9be" strokeWidth="1.6" />
        <path d="M126 52 v80" stroke="#ffffff" strokeWidth="5" opacity="0.55" strokeLinecap="round" />
        <path d="M198 56 v66" stroke="#ffffff" strokeWidth="2.4" opacity="0.35" strokeLinecap="round" />
        <rect x="108" y="32" width="112" height="16" rx="7" fill="#16594a" />
        <rect x="108" y="32" width="112" height="5" rx="2.5" fill="#ffffff" opacity="0.2" />
      </g>
      {/* rod + disc */}
      <circle cx="164" cy="20" r="13" fill="url(#metalGrad)" stroke="#5e7268" />
      <rect x="161" y="30" width="6" height="52" rx="3" fill="#c4703f" />
      {/* leaves */}
      <g>
        <path d="M164 82 l-22 44 l7 3 l18 -42 z" fill="#d8e3de" stroke="#9fb4ac" strokeWidth="0.8" />
        <path d="M164 82 l22 44 l-7 3 l-18 -42 z" fill="#c3d2cc" stroke="#9fb4ac" strokeWidth="0.8" />
      </g>
      <ChargeDot x={138} y={116} sign="-" r={4.4} />
      <ChargeDot x={190} y={116} sign="-" r={4.4} />
      <ChargeDot x={164} y={20} sign="+" r={4.6} />
      {/* approaching rod */}
      <g transform="rotate(18 268 60)">
        <rect x="228" y="52" width="82" height="17" rx="8.5" fill="url(#rodGrad)" />
        <rect x="233" y="55" width="70" height="4" rx="2" fill="#fff" opacity="0.3" />
      </g>
      {[0, 1, 2].map((i) => (
        <ChargeDot key={i} x={240 + i * 24} y={44 + i * 7} sign="-" r={4.2} />
      ))}
      <FieldArc d="M226 62 C 208 56, 192 42, 178 30" color="#2e9aa6" />
      <text x="16" y="152" fontSize="9.5" fill="#5e7268">
        الكاشف المنزلي: الورقتان تكتسبان الشحنة نفسها فتنفرجان
      </text>
    </g>
  );
}

function PepperScene() {
  const grains = [
    { x: 128, y: 118, dark: false },
    { x: 142, y: 122, dark: true },
    { x: 156, y: 117, dark: false },
    { x: 170, y: 121, dark: true },
    { x: 186, y: 118, dark: false },
    { x: 200, y: 122, dark: true },
    { x: 112, y: 122, dark: true },
    { x: 214, y: 119, dark: false },
  ];
  return (
    <g>
      <rect width="320" height="160" fill="#fbf8f1" />
      <Table y={132} />
      {/* plate */}
      <ellipse cx="164" cy="122" rx="82" ry="20" fill="#ffffff" stroke="#dcd2bd" strokeWidth="2" />
      <ellipse cx="164" cy="119" rx="66" ry="14" fill="#f6f1e4" />
      {grains.map((g, i) => (
        <circle key={i} cx={g.x} cy={g.y} r={g.dark ? 2.4 : 2} fill={g.dark ? "#2b2723" : "#ffffff"} stroke={g.dark ? "none" : "#d8cdb6"} strokeWidth="0.6" />
      ))}
      {/* lifted pepper */}
      {[0, 1, 2].map((i) => (
        <g key={i} className="anim-float" style={{ animationDelay: `${i * 0.45}s` }}>
          <circle cx={146 + i * 16} cy={86 - i * 8} r="2.6" fill="#2b2723" />
        </g>
      ))}
      <FieldArc d="M150 84 C 148 74, 150 66, 154 58" />
      <FieldArc d="M182 74 C 182 66, 184 60, 188 54" />
      {/* spoon */}
      <g filter="url(#softDrop)" transform="rotate(-8 190 40)">
        <rect x="150" y="30" width="118" height="13" rx="6.5" fill="url(#combGrad)" />
        <ellipse cx="146" cy="37" rx="20" ry="13" fill="url(#combGrad)" />
        <ellipse cx="146" cy="35" rx="13" ry="8" fill="#0d4a3a" opacity="0.5" />
        <rect x="158" y="32" width="96" height="3.6" rx="1.8" fill="#ffffff" opacity="0.28" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <ChargeDot key={i} x={144 + i * 32} y={16} sign="-" r={4.4} />
      ))}
      <text x="16" y="152" fontSize="9.5" fill="#5e7268">
        الفلفل أخفّ، فتكفي قوة صغيرة لرفعه قبل الملح
      </text>
    </g>
  );
}

function SparkScene() {
  return (
    <g>
      <rect width="320" height="160" fill="#0a1f1b" />
      <rect width="320" height="160" fill="url(#vignette)" />
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%">
          <stop offset="55%" stopColor="#0a1f1b" stopOpacity="0" />
          <stop offset="100%" stopColor="#03110e" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {/* door + knob */}
      <rect x="196" y="18" width="110" height="130" rx="6" fill="#123830" />
      <rect x="206" y="30" width="90" height="52" rx="4" fill="#0e2f28" stroke="#1c5245" />
      <circle cx="214" cy="104" r="11" fill="url(#metalGrad)" />
      <circle cx="211" cy="101" r="4" fill="#ffffff" opacity="0.35" />
      {/* hand */}
      <path d="M40 118 q 40 -16 84 -14 l 26 2 q 8 1 8 6 t -8 6 l -30 2 q 12 6 10 12 q -2 6 -12 4 l -26 -6 q -30 -2 -52 -12 z" fill="#c99a76" opacity="0.85" />
      {/* spark */}
      <circle cx="176" cy="106" r="42" fill="url(#sparkGlow)" />
      <path d="M158 104 l12 -6 l-6 8 l14 -2 l-10 8 l12 2" stroke="#fff3cf" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M158 104 l12 -6 l-6 8 l14 -2 l-10 8 l12 2" stroke="#f2c14e" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.35" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={176 + Math.cos(rad) * 16}
            y1={106 + Math.sin(rad) * 16}
            x2={176 + Math.cos(rad) * 24}
            y2={106 + Math.sin(rad) * 24}
            stroke="#f2c14e"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        );
      })}
      <text x="16" y="146" fontSize="9.5" fill="#8fd9be">
        كل مليمتر من الشرارة ≈ 3000 فولت
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* application scenes                                                  */
/* ------------------------------------------------------------------ */

export function AppArt({ id, className, title }: ArtProps & { id: string }) {
  return (
    <svg viewBox="0 0 240 130" className={className} role="img" aria-label={title ?? "رسم توضيحي للتطبيق"}>
      <title>{title ?? "رسم توضيحي للتطبيق"}</title>
      <defs>
        <BaseDefs />
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2f28" />
          <stop offset="100%" stopColor="#14514a" />
        </linearGradient>
        <linearGradient id="drumGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2fa07c" />
          <stop offset="100%" stopColor="#0d4a3a" />
        </linearGradient>
      </defs>
      <rect width="240" height="130" rx="14" fill="url(#skyGrad)" />
      {id === "rod" && <RodArt />}
      {id === "paint" && <PaintArt />}
      {id === "copier" && <CopierArt />}
      {id === "filter" && <FilterArt />}
      {id === "vdg" && <VdgArt />}
      {id === "touch" && <TouchArt />}
    </svg>
  );
}

function RodArt() {
  return (
    <g>
      {/* storm cloud */}
      <g opacity="0.9">
        <ellipse cx="70" cy="30" rx="42" ry="18" fill="#12463c" />
        <ellipse cx="104" cy="26" rx="30" ry="15" fill="#0f3a33" />
        <ellipse cx="46" cy="34" rx="24" ry="12" fill="#0f3a33" />
      </g>
      {[52, 74, 96].map((x, i) => (
        <ChargeDot key={i} x={x} y={40} sign="-" r={3.8} />
      ))}
      {/* bolt */}
      <path d="M92 46 l-14 26 h12 l-8 22 22 -30 h-13 z" fill="#f2c14e" />
      {/* building */}
      <rect x="140" y="46" width="70" height="70" rx="4" fill="#0e3b33" stroke="#1e7f63" />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={148 + (i % 3) * 20} y={56 + Math.floor(i / 3) * 18} width="12" height="10" rx="2" fill={i % 4 === 0 ? "#f2c14e" : "#134b41"} opacity={i % 4 === 0 ? 0.9 : 1} />
      ))}
      {/* rod + earth */}
      <line x1="175" y1="46" x2="175" y2="20" stroke="#f2c14e" strokeWidth="2.6" />
      <circle cx="175" cy="18" r="3.4" fill="#f2c14e" />
      <circle cx="175" cy="18" r="9" fill="#f2c14e" opacity="0.2" className="anim-pulse-soft" />
      <path d="M210 60 C 224 74, 224 96, 216 116" stroke="#f2c14e" strokeWidth="2.2" fill="none" strokeDasharray="4 5" />
      <line x1="204" y1="116" x2="228" y2="116" stroke="#8fd9be" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="209" y1="121" x2="223" y2="121" stroke="#8fd9be" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="213" y1="126" x2="219" y2="126" stroke="#8fd9be" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  );
}

function PaintArt() {
  return (
    <g>
      {/* car panel */}
      <path d="M150 96 q 12 -46 44 -52 v52 z" fill="#123f37" stroke="#2fa07c" strokeWidth="1.4" />
      <path d="M150 96 h84" stroke="#2fa07c" strokeWidth="1.4" />
      {[0, 1, 2].map((i) => (
        <ChargeDot key={i} x={168 + i * 22} y={90} sign="+" r={3.6} />
      ))}
      {/* spray gun */}
      <g>
        <rect x="18" y="46" width="42" height="14" rx="5" fill="url(#metalGrad)" />
        <rect x="30" y="60" width="12" height="26" rx="4" fill="#5e7268" />
        <rect x="58" y="49" width="12" height="8" rx="3" fill="#8ea39b" />
      </g>
      {/* droplet cone */}
      <path d="M70 53 L146 32 L146 76 z" fill="#2fa07c" opacity="0.12" />
      {Array.from({ length: 14 }).map((_, i) => {
        const t = (i % 7) / 6;
        const x = 74 + t * 66;
        const y = 53 + (i < 7 ? -1 : 1) * (6 + t * 20) * (0.4 + ((i * 7) % 5) / 8);
        return <circle key={i} cx={x} cy={y} r="2.6" fill="#56c39c" opacity="0.9" />;
      })}
      {[0, 1, 2, 3].map((i) => (
        <ChargeDot key={i} x={86 + i * 18} y={44 - i * 2} sign="-" r={3.4} />
      ))}
      <FieldArc d="M100 36 C 122 30, 142 34, 156 44" color="#8fd9be" width={1.2} />
      <FieldArc d="M100 72 C 122 80, 142 78, 156 70" color="#8fd9be" width={1.2} />
    </g>
  );
}

function CopierArt() {
  return (
    <g>
      {/* drum */}
      <circle cx="96" cy="60" r="40" fill="url(#drumGrad)" stroke="#56c39c" strokeWidth="1.6" />
      <circle cx="96" cy="60" r="12" fill="#0a2f28" stroke="#2fa07c" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <ChargeDot key={i} x={96 + Math.cos(a) * 32} y={60 + Math.sin(a) * 32} sign={i > 3 && i < 9 ? "+" : "-"} r={3.2} />;
      })}
      {/* laser */}
      <path d="M14 22 L84 44" stroke="#e05a45" strokeWidth="2.2" strokeDasharray="6 5" className="anim-dash" />
      <circle cx="14" cy="22" r="5" fill="#e05a45" />
      {/* toner */}
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={150 + (i % 4) * 10} cy={34 + Math.floor(i / 4) * 12} r="2.6" fill="#0a2f28" stroke="#56c39c" strokeWidth="0.7" />
      ))}
      <path d="M140 60 q 18 -6 34 0" stroke="#56c39c" strokeWidth="1.4" fill="none" strokeDasharray="4 4" />
      {/* paper */}
      <g filter="url(#softDrop)">
        <rect x="150" y="74" width="72" height="42" rx="4" fill="#f4f9f6" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="158" y1={84 + i * 8} x2={210 - i * 8} y2={84 + i * 8} stroke="#5e7268" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        ))}
      </g>
    </g>
  );
}

function FilterArt() {
  return (
    <g>
      {/* duct */}
      <rect x="30" y="20" width="180" height="90" rx="8" fill="#0e3b33" stroke="#1e7f63" strokeWidth="1.6" />
      {/* dirty in */}
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={40 + (i % 3) * 9} cy={30 + i * 8} r={2.8} fill="#8ea39b" opacity="0.85" />
      ))}
      {/* wires */}
      {[78, 96].map((x) => (
        <g key={x}>
          <line x1={x} y1="26" x2={x} y2="104" stroke="#f2c14e" strokeWidth="1.8" />
          {[38, 58, 78, 96].map((y) => (
            <ChargeDot key={y} x={x} y={y} sign="-" r={3} />
          ))}
        </g>
      ))}
      {/* plates */}
      {[126, 148, 170].map((x) => (
        <g key={x}>
          <rect x={x} y="26" width="7" height="78" rx="3" fill="#56c39c" opacity="0.75" />
          {[36, 58, 80].map((y) => (
            <ChargeDot key={y} x={x + 3.5} y={y} sign="+" r={2.8} />
          ))}
        </g>
      ))}
      <FieldArc d="M100 64 C 112 64, 118 64, 126 64" color="#f2c14e" width={1.2} />
      {/* clean out */}
      <path d="M196 64 h22" stroke="#8fd9be" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="222,64 212,59 212,69" fill="#8fd9be" />
      <text x="34" y="122" fontSize="8.5" fill="#8fd9be">
        هواء محمّل بالغبار
      </text>
      <text x="170" y="122" fontSize="8.5" fill="#8fd9be">
        هواء نظيف
      </text>
    </g>
  );
}

function VdgArt() {
  return (
    <g>
      {/* dome */}
      <circle cx="120" cy="46" r="34" fill="url(#metalGrad)" />
      <ellipse cx="108" cy="34" rx="12" ry="8" fill="#ffffff" opacity="0.35" transform="rotate(-25 108 34)" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = Math.PI + (i / 7) * Math.PI;
        return <ChargeDot key={i} x={120 + Math.cos(a) * 38} y={46 + Math.sin(a) * 38} sign="+" r={3.4} />;
      })}
      {/* column + belt */}
      <rect x="108" y="76" width="24" height="42" rx="8" fill="#0f3a33" stroke="#1e7f63" />
      <rect x="116" y="80" width="8" height="34" rx="4" fill="#f2c14e" opacity="0.55" />
      <rect x="92" y="116" width="56" height="10" rx="5" fill="#123f37" stroke="#1e7f63" />
      {/* hair standing */}
      <path d="M186 118 q -4 -28 14 -32 q 18 -4 20 22 l 0 10 z" fill="#c99a76" opacity="0.7" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M${190 + i * 5} ${88} q ${2 + i} -14 ${8 + i * 2} -20`} stroke="#4a3a2f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ))}
      <path d="M154 52 q 14 -6 24 4" stroke="#f2c14e" strokeWidth="1.6" fill="none" strokeDasharray="4 4" className="anim-dash" />
    </g>
  );
}

function TouchArt() {
  return (
    <g>
      {/* phone */}
      <rect x="66" y="12" width="80" height="106" rx="12" fill="#0e3b33" stroke="#2fa07c" strokeWidth="1.6" />
      <rect x="74" y="22" width="64" height="84" rx="6" fill="#0a2f28" />
      {/* capacitive grid */}
      {Array.from({ length: 6 }).map((_, r) =>
        Array.from({ length: 5 }).map((__, c) => (
          <circle key={`${r}-${c}`} cx={82 + c * 13} cy={30 + r * 14} r="1.8" fill="#2fa07c" opacity="0.55" />
        )),
      )}
      {/* touch ripple */}
      <circle cx="112" cy="66" r="9" fill="#f2c14e" opacity="0.4" />
      <circle cx="112" cy="66" r="18" fill="none" stroke="#f2c14e" strokeWidth="1.4" opacity="0.5" className="anim-pulse-soft" />
      <circle cx="112" cy="66" r="27" fill="none" stroke="#f2c14e" strokeWidth="1" opacity="0.3" />
      {/* finger */}
      <path d="M146 118 q 6 -34 -18 -46 q -14 -8 -22 2 q -6 8 4 14 q 10 6 8 18 z" fill="#c99a76" opacity="0.9" />
      {[0, 1, 2].map((i) => (
        <ChargeDot key={i} x={104 + i * 8} y={90} sign="-" r={3.2} />
      ))}
      <text x="152" y="30" fontSize="8.5" fill="#8fd9be">
        شبكة سعوية
      </text>
      <text x="152" y="44" fontSize="8.5" fill="#8fd9be">
        تحت الزجاج
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* hero scene                                                          */
/* ------------------------------------------------------------------ */

export function HeroArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 340 190" className={className} role="img" aria-label="مشط مدلوك يجذب قصاصات ورق مستقطبة">
      <title>مشط مدلوك يجذب قصاصات ورق مستقطبة</title>
      <defs>
        <BaseDefs />
      </defs>
      <rect width="340" height="190" rx="18" fill="#f7fbf7" />
      <g opacity="0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={20 + i * 38} y1="8" x2={20 + i * 38} y2="182" stroke="#e3f4ec" />
        ))}
      </g>

      {/* comb */}
      <g filter="url(#softDrop)">
        <rect x="46" y="24" width="248" height="22" rx="10" fill="url(#combGrad)" />
        <rect x="54" y="28" width="230" height="5" rx="2.5" fill="#ffffff" opacity="0.3" />
        {Array.from({ length: 22 }).map((_, i) => (
          <path key={i} d={`M${56 + i * 11} 46 h6.4 l-1.5 26 h-3.4 z`} fill="url(#combGrad)" />
        ))}
      </g>
      {Array.from({ length: 8 }).map((_, i) => (
        <ChargeDot key={i} x={62 + i * 30} y={16} sign="-" r={5} />
      ))}

      {/* field lines */}
      <FieldArc d="M120 76 C 116 92, 118 104, 124 114" />
      <FieldArc d="M170 76 C 168 94, 170 106, 172 116" />
      <FieldArc d="M222 76 C 226 92, 224 104, 220 114" />

      <Table y={152} w={340} />

      {[
        { x: 92, y: 140, rot: -12, air: false },
        { x: 132, y: 108, rot: 20, air: true },
        { x: 172, y: 92, rot: -26, air: true },
        { x: 214, y: 110, rot: 14, air: true },
        { x: 256, y: 142, rot: -6, air: false },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.rot})`} className={p.air ? "anim-float" : undefined} style={{ animationDelay: `${i * 0.55}s` }}>
          <rect x="-13" y="-8" width="26" height="16" rx="2.5" fill="url(#paperGrad)" stroke="#c9b58f" />
          <line x1="-7" y1="-3.5" x2="7" y2="-3.5" stroke="#dccdae" strokeWidth="1" />
          <ChargeDot x={-7} y={3.5} sign="+" r={3.4} />
          <ChargeDot x={7} y={3.5} sign="-" r={3.4} />
        </g>
      ))}
    </svg>
  );
}
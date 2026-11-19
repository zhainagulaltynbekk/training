// Simple line illustrations for exercises that have no photo in the open dataset.
const wrap = (inner, frame) => `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" class="art" data-frame="${frame}">
<rect width="300" height="200" fill="#eef1f5"/>
<g fill="none" stroke="#1f2937" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
const head = (x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="#1f2937" stroke="none"/>`;

export const ART = {
  wallsit: [
    wrap(`<line x1="70" y1="20" x2="70" y2="185" stroke="#9aa4b2" stroke-width="10"/><line x1="20" y1="185" x2="280" y2="185" stroke="#9aa4b2" stroke-width="6"/>
      ${head(92, 48)}<path d="M88 64 L84 120"/><path d="M84 120 L140 122 L142 182"/><path d="M142 182 L162 182"/><path d="M86 78 L110 102 L128 100"/>`, 0),
    wrap(`<line x1="70" y1="20" x2="70" y2="185" stroke="#9aa4b2" stroke-width="10"/><line x1="20" y1="185" x2="280" y2="185" stroke="#9aa4b2" stroke-width="6"/>
      ${head(92, 52)}<path d="M88 68 L84 122"/><path d="M84 122 L141 124 L142 182"/><path d="M142 182 L162 182"/><path d="M86 82 L118 92 L136 90"/>`, 1),
  ],
  swim: [
    wrap(`<path d="M10 120 Q 40 108 70 120 T 130 120 T 190 120 T 250 120 T 310 120" stroke="#3b82f6" stroke-width="5"/>
      ${head(220, 112)}<path d="M206 116 L130 122 L70 118"/><path d="M200 116 L240 80 L270 100"/><path d="M130 122 L100 140 L70 130"/>`, 0),
    wrap(`<path d="M10 120 Q 40 132 70 120 T 130 120 T 190 120 T 250 120 T 310 120" stroke="#3b82f6" stroke-width="5"/>
      ${head(220, 114)}<path d="M206 118 L130 122 L70 126"/><path d="M200 118 L170 150 L140 140"/><path d="M130 122 L100 108 L70 116"/>`, 1),
  ],
  nineninety: [
    wrap(`<line x1="20" y1="180" x2="280" y2="180" stroke="#9aa4b2" stroke-width="6"/>
      ${head(150, 50)}<path d="M150 66 L150 140"/><path d="M150 84 L120 120 L118 172"/><path d="M150 84 L180 120 L182 172"/>
      <path d="M150 140 L90 170 L60 150"/><path d="M150 140 L205 175 L250 150"/>`, 0),
    wrap(`<line x1="20" y1="180" x2="280" y2="180" stroke="#9aa4b2" stroke-width="6"/>
      ${head(150, 50)}<path d="M150 66 L150 140"/><path d="M150 84 L120 120 L118 172"/><path d="M150 84 L180 120 L182 172"/>
      <path d="M150 140 L210 170 L240 150"/><path d="M150 140 L95 175 L50 150"/>`, 1),
  ],
  walk: [
    wrap(`<line x1="20" y1="185" x2="280" y2="185" stroke="#9aa4b2" stroke-width="6"/>
      ${head(150, 30)}<path d="M150 46 L148 110"/><path d="M148 110 L120 150 L108 184"/><path d="M148 110 L170 148 L192 182"/>
      <path d="M149 60 L176 90 L186 110"/><path d="M149 60 L126 88 L120 110"/>`, 0),
    wrap(`<line x1="20" y1="185" x2="280" y2="185" stroke="#9aa4b2" stroke-width="6"/>
      ${head(150, 30)}<path d="M150 46 L148 110"/><path d="M148 110 L176 150 L190 184"/><path d="M148 110 L130 148 L110 182"/>
      <path d="M149 60 L124 90 L114 110"/><path d="M149 60 L172 88 L180 110"/>`, 1),
  ],
};

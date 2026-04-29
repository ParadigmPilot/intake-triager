// Briefing — prompt assembler
//
// Per intake-triager-gold-vision.md v1.5 §4 *Briefing public API*.
// Reads src/backend/prompts/system.md once at module load, caches for
// the process lifetime. assemblePrompt substitutes {{NAME}} placeholders
// against the trusted-context pool per turn and returns the array
// passed to the Chef.
//
// Substitution rule: /\{\{(\w+)\}\}/g — alphanumeric placeholder names
// per gold vision §6 *Placeholder convention*. Unknown placeholders are
// left in place. Patron text is never substituted; only trusted context
// values are.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemMdPath = join(__dirname, 'prompts', 'system.md');

// Read once at module load — process-lifetime cache.
const systemTemplate = readFileSync(systemMdPath, 'utf8');

function substitute(template, placeholders) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    return Object.prototype.hasOwnProperty.call(placeholders, name)
      ? String(placeholders[name])
      : match;
  });
}

export function assemblePrompt({ placeholders, history }) {
  const systemContent = substitute(systemTemplate, placeholders);
  return [
    { role: 'system', content: systemContent },
    ...history.map(({ role, content }) => ({ role, content })),
  ];
}

export default { assemblePrompt };

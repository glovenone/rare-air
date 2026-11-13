export function wrapText(value, maxWidth, measure) {
  const lines = [""];
  for (const word of String(value).trim().split(/\s+/)) {
    const current = lines[lines.length - 1];
    const next = current ? `${current} ${word}` : word;
    if (measure(next) <= maxWidth) {
      lines[lines.length - 1] = next;
      continue;
    }
    if (current) lines.push("");
    for (const character of word) {
      const line = lines[lines.length - 1];
      if (line && measure(line + character) > maxWidth) lines.push(character);
      else lines[lines.length - 1] += character;
    }
  }
  return lines;
}

// /lib/colorUtils.ts
export const colorMapping: Record<string, string> = {
  blue: '23,137,219', // from #1789db
  green: '114,176,20', // from #72b014
  orange: '255,158,87', // from #f5791f
};

export const getGradientFromColorName = (
  colorName: string
): string => {
  const rgb =
    colorMapping[colorName.toLowerCase()] || colorMapping['blue'];
  return `linear-gradient(
    to left,
    rgba(${rgb}, 0.55) 15%,
    rgba(${rgb}, 0.35) 50%,
    rgba(${rgb}, 0.25) 80%
  )`;
};

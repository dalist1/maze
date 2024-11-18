export const clearScreen = (): void => {
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
};

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const formatPercentage = (value: number): string => 
  `${(value * 100).toFixed(1)}%`;

export const centerText = (text: string, width: number): string => {
  const padding = Math.max(0, width - text.length);
  const [leftPad, rightPad] = [Math.floor(padding / 2), padding - Math.floor(padding / 2)];
  return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
};

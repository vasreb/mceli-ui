type Deviation = {
  text: string;
  color: string;
};

const formatPercent = (value: number) => `${value >= 0 ? '↑' : '↓'}${Math.abs(value).toFixed(1)}%`;

export const computeDeviation = (value: number, average?: number): Deviation | null => {
  if (average === undefined || average === 0) {
    return null;
  }
  const percent = ((value - average) / average) * 100;
  const color = percent >= 0 ? '#0f9d58' : '#ea4335';
  return { text: formatPercent(percent), color };
};




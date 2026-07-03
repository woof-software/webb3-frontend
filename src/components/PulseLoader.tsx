export interface PulseLoaderProps {
  triggerPulse?: boolean;
}

export const PulseLoader = ({ triggerPulse = false }: PulseLoaderProps) => {
  return (
    <div className={triggerPulse ? 'pulse-loader pulse-loader--triggered' : 'pulse-loader'} />
  );
};

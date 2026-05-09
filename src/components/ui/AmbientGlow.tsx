interface Props {
  className?: string;
}

const AmbientGlow = ({ className = "" }: Props) => (
  <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
    <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-primary/20 blur-[120px]" />
    <div className="absolute -bottom-32 -left-24 w-[420px] h-[420px] rounded-full bg-accent/20 blur-[100px]" />
  </div>
);

export default AmbientGlow;

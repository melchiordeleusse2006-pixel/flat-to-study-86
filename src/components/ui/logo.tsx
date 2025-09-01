interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <img
      src="/lovable-uploads/513cd51e-b6ee-4675-93fe-5190be980a2e.png"
      alt="flat2study logo"
      width={size}
      height={size}
      className={`${className} object-contain`}
      style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346%) brightness(104%) contrast(97%)' }}
    />
  );
}
interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <img
      src="/logo.jpg"
      alt="flat2study logo"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
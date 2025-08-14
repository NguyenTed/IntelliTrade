import PersonIcon from "@mui/icons-material/Person";

interface DefaultAvatarProps {
  size?: number;
  className?: string;
}

export default function DefaultAvatar({
  size = 40,
  className = "",
}: DefaultAvatarProps) {
  return (
    <div
      className={`rounded-full bg-gray-300 flex items-center justify-center text-white ${className}`}
      style={{ width: size, height: size }}
    >
      <PersonIcon style={{ fontSize: size * 0.6 }} />
    </div>
  );
}

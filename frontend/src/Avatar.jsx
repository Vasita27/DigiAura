import avatar from "./assets/avatar.png";

export default function Avatar() {
  return (
    <img
      src={avatar}
      alt="Avatar"
      style={{ width: 200, borderRadius: "50%" }}
    />
  );
}

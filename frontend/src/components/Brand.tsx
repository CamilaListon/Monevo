import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark">
        <Wallet size={19} strokeWidth={2.2} />
      </span>
      <span>
        monevo<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Simplifier", href: "/", icon: "📝", enabled: true },
  { label: "Eligibility Matcher", href: "/matcher", icon: "🎯", enabled: false },
  { label: "Scheme Explorer", href: "/explorer", icon: "🔍", enabled: false },
];

const generalItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊", enabled: false },
  { label: "Settings", href: "/settings", icon: "⚙️", enabled: false },
  { label: "Help", href: "/help", icon: "❓", enabled: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/result";
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>S</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            Saral
          </span>
        </Link>
      </div>

      {/* Menu section */}
      <nav style={{ padding: "0 12px", flex: 1 }}>
        <div className="section-label" style={{ padding: "0 16px" }}>
          Menu
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <div className="sidebar-nav-item disabled">
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                  <span className="badge badge-gray" style={{ marginLeft: "auto" }}>Soon</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="divider" style={{ margin: "16px 16px" }} />

        <div className="section-label" style={{ padding: "0 16px" }}>
          General
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {generalItems.map((item) => (
            <div key={item.href}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className={`sidebar-nav-item ${isActive(item.href) ? "active" : ""}`}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <div className="sidebar-nav-item disabled">
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom info card */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            background: "var(--primary-50)",
            border: "1px solid var(--primary-light)",
            borderRadius: 12,
            padding: "16px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--primary-dark)", marginBottom: 4 }}>
            100% Free & Private
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            No sign-up needed. Your documents are never stored on our servers.
          </div>
        </div>
      </div>
    </aside>
  );
}

import { BookOpenText, Cloud, Home, Settings, Speech, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const nav = [
  { to: "/", label: "今日研习", short: "首页", icon: Home },
  { to: "/questions", label: "题库", short: "题库", icon: BookOpenText },
  { to: "/pronunciation", label: "发音词库", short: "发音", icon: Speech },
  { to: "/settings", label: "数据与设置", short: "设置", icon: Settings },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <aside className={`sidebar ${open ? "is-open" : ""}`}>
      <div className="brand"><Cloud aria-hidden="true" /><div><strong>青云研语</strong><span>QINGYUN SPEAK</span></div></div>
      <nav aria-label="主导航">{nav.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
      <blockquote>Think first.<br />Speak clearly.</blockquote>
    </aside>
    {open && <button className="nav-backdrop" onClick={() => setOpen(false)} aria-label="关闭导航" />}
    <header className="mobile-header"><div className="brand"><Cloud /><strong>青云研语</strong></div><button className="icon-button" onClick={() => setOpen(!open)} aria-label={open ? "关闭菜单" : "打开菜单"}>{open ? <X /> : <Menu />}</button></header>
    <main id="main-content" key={location.pathname}><Outlet /></main>
    <nav className="bottom-nav" aria-label="移动端主导航">{nav.map(({ to, short, icon: Icon }) =>
      <NavLink key={to} to={to} end={to === "/"}><Icon size={20} /><span>{short}</span></NavLink>)}</nav>
  </div>;
}

import Link from 'next/link';

export const Header = () => (
  <header className="header container">
    <strong>DJMC Batch 35</strong>
    <nav className="nav">
      <Link href="/">Home</Link>
      <Link href="/add-profile">Add Profile</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  </header>
);

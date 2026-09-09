import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          PurelyBeingHuman
        </Link>

        {/* Navigation Menu */}
        <ul className="hidden md:flex gap-8">
          <li>
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/books"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Books
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/resources"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Resources
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-gray-700 hover:text-blue-600"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
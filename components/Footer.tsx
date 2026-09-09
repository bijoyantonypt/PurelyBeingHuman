import Link from 'next/link';
import { FaTwitter, FaLinkedin, FaInstagram, FaMedium, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              PurelyBeingHuman
            </h3>
            <p className="text-sm text-gray-400">
              Exploring what it means to be authentically human.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/books"
                  className="hover:text-white transition-colors"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="hover:text-white transition-colors"
                >
                  Free Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/offers"
                  className="hover:text-white transition-colors"
                >
                  Special Offers
                </Link>
              </li>
              <li>
                <a
                  href="#newsletter"
                  className="hover:text-white transition-colors"
                >
                  Newsletter
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Me</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/purelybeinghumanauthor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://linkedin.com/in/purelybeinghumanauthor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href="https://instagram.com/purelybeinghumanauthor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://medium.com/@purelybeinghumanauthor"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Medium"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaMedium size={24} />
              </a>
              <a
                href="mailto:contact@purelybeinghuman.com"
                aria-label="Email"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaEnvelope size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PurelyBeingHuman. All rights
              reserved.
            </p>
            <div className="flex gap-6 text-sm mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

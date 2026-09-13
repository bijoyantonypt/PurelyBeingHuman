import './globals.css';

export const metadata = {
  title: 'PurelyBeingHuman | Books, Offers & Articles',
  description:
    'PurelyBeingHuman brings together inspiring books, exclusive offers, coupon codes, and thoughtful articles focused on authentic living.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

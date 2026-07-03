import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-display font-black text-3xl mb-1">
              <span>Pi</span><span className="text-coral-500">z</span><span>i</span>
            </div>
            <p className="text-xs text-cream/60 tracking-wider mb-3">LIVE BETTER · STAY SMARTER</p>
            <p className="text-sm text-cream/70 leading-relaxed">India's most trusted PG aggregator. Verified listings, real photos, honest rents.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Browse</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link href="/search" className="hover:text-coral-400">All PGs</Link></li>
              <li><Link href="/city/delhi" className="hover:text-coral-400">Delhi</Link></li>
              <li><Link href="/city/noida" className="hover:text-coral-400">Noida</Link></li>
              <li><Link href="/city/gurgaon" className="hover:text-coral-400">Gurgaon</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">For Owners</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><Link href="/register?role=owner" className="hover:text-coral-400">List your PG</Link></li>
              <li><Link href="/owner" className="hover:text-coral-400">Owner Dashboard</Link></li>
              <li><Link href="/blog" className="hover:text-coral-400">PG Owner Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="https://wa.me/919758285929" className="hover:text-coral-400">WhatsApp Us</a></li>
              <li><a href="tel:9758285929" className="hover:text-coral-400">Call: 9758285929</a></li>
              <li><Link href="/blog" className="hover:text-coral-400">Blog</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/10 text-center text-xs text-cream/50">
          © {new Date().getFullYear()} Help Together Media Pvt Ltd · All rights reserved
        </div>
      </div>
    </footer>
  );
}

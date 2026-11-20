import { ShieldCheck, Smartphone, Ticket } from 'lucide-react';
import { img, PHOTOS } from '../../constants/images';
import LiquidGlass from '../ui/LiquidGlass';
import Scribble from '../ui/Scribble';

/**
 * Two-panel layout for sign in / sign up / password pages.
 * Left (desktop only): traveller photo with a glass panel restating why an
 * account helps. Right: the form, in a white card.
 */
export default function AuthShell({ eyebrow, title, subtitle, notice, photo = PHOTOS.window, children }) {
  return (
    <div className="px-3 pb-10 pt-4 sm:px-6">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(10,31,60,0.45)] ring-1 ring-asphalt/8 lg:grid-cols-[1fr_1.05fr]">
        <aside className="relative isolate hidden min-h-[640px] overflow-hidden lg:block">
          <img src={img(photo, 1000, 1300)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-asphalt via-asphalt/30 to-transparent" aria-hidden="true" />
          <div className="absolute inset-x-6 bottom-6">
            <LiquidGlass radius={24} tint="rgba(10,31,60,0.3)" className="p-6 text-white">
              <p className="font-display text-3xl font-bold leading-tight">
                Travel Nigeria, <Scribble delay={500}>sorted</Scribble>.
              </p>
              <ul className="mt-5 space-y-2.5 text-[15px] text-white/90">
                <li className="flex items-center gap-2.5"><Ticket size="1.1em" className="text-sky" aria-hidden="true" /> All your tickets in one place</li>
                <li className="flex items-center gap-2.5"><Smartphone size="1.1em" className="text-sky" aria-hidden="true" /> Check in and change dates from your phone</li>
                <li className="flex items-center gap-2.5"><ShieldCheck size="1.1em" className="text-sky" aria-hidden="true" /> Payments secured by Paystack</li>
              </ul>
            </LiquidGlass>
          </div>
        </aside>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14">
          <div className="mx-auto w-full max-w-md">
            {eyebrow && <p className="text-sm font-bold uppercase tracking-wider text-rose">{eyebrow}</p>}
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-asphalt">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-slate">{subtitle}</p>}
            {notice && (
              <p role="status" className="mt-6 rounded-xl bg-signal-soft px-4 py-3 text-sm font-semibold text-signal">
                {notice}
              </p>
            )}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

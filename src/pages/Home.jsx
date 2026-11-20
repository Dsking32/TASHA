import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Armchair,
  Bus,
  CalendarClock,
  CreditCard,
  MapPinned,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Ticket,
} from 'lucide-react';
import SearchPanel from '../components/home/SearchPanel';
import FrequentRoutes from '../components/home/FrequentRoutes';
import UpcomingDepartures from '../components/home/UpcomingDepartures';
import LiquidGlass from '../components/ui/LiquidGlass';
import Reveal from '../components/ui/Reveal';
import Scribble from '../components/ui/Scribble';
import { img, PHOTOS } from '../constants/images';

// Mirrors the cities the backend serves (database/seeders/LocationSeeder.php).
const CITIES = ['Kano', 'Kaduna', 'Katsina', 'Maiduguri, Borno', 'Yola', 'Bauchi', 'Sokoto', 'Abuja', 'Lagos'];

const STEPS = [
  { Icon: Search, title: 'Pick your route', copy: 'Choose where you are leaving from, where you are going, and the day.' },
  { Icon: CreditCard, title: 'Pay online', copy: 'Add each passenger’s name and phone number, then pay securely through Paystack.' },
  { Icon: Armchair, title: 'Choose your seat', copy: 'Pick your seat on the bus layout. Your ticket is ready straight away.' },
];

const AFTER = [
  { Icon: MapPinned, title: 'Check in from your phone', copy: 'Opens 3 hours before departure.' },
  { Icon: CalendarClock, title: 'Change your date', copy: 'Move to another bus on the same route.' },
  { Icon: Share2, title: 'Share your trip', copy: 'Send family your bus and departure time.' },
];

function CityMarquee() {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {CITIES.map((c) => (
        <li key={c} className="flex items-center gap-8 whitespace-nowrap font-display text-2xl font-bold text-white sm:text-3xl">
          {c}
          <Bus size={22} className="text-white/60" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden bg-rose py-5" aria-label={`Cities we serve: ${CITIES.join(', ')}`}>
      <div className="flex w-max [animation:marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-asphalt">
        <img
          src={img(PHOTOS.hero, 2000)}
          alt="A loaded passenger bus on a highway in northern Nigeria at dawn"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover [animation:ken-burns_24s_var(--ease-in-out)_infinite_alternate]"
        />
        {/* Left-weighted shade so the headline reads; the road and sky stay visible on the right */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt/90 via-asphalt/55 to-asphalt/10" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-asphalt/70 to-transparent" aria-hidden="true" />

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-32 sm:pt-36 lg:min-h-[760px] lg:grid-cols-[1fr_460px] lg:gap-14 lg:pb-24">
          <div className="text-white">
            <p className="inline-flex animate-[fade-up_0.6s_var(--ease-out)_both] items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-rose" aria-hidden="true" />
              Intercity buses across northern Nigeria, Abuja and Lagos
            </p>
            <h1 className="mt-6 animate-[fade-up_0.7s_var(--ease-out)_0.08s_both] font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              Book your bus seat in <Scribble delay={800}>minutes</Scribble>.
            </h1>
            <p className="mt-6 max-w-lg animate-[fade-up_0.7s_var(--ease-out)_0.16s_both] text-lg leading-relaxed text-white/85">
              Choose your route, pay online and show your ticket on your phone at
              the terminal. No queue at the counter.
            </p>

            <div className="mt-8 flex animate-[fade-up_0.7s_var(--ease-out)_0.24s_both] flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex -space-x-3">
                {PHOTOS.faces.map((f) => (
                  <img
                    key={f}
                    src={img(f, 96, 96)}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-asphalt"
                  />
                ))}
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/90">
                <li className="flex items-center gap-1.5"><ShieldCheck size="1.1em" className="text-sky" aria-hidden="true" /> Secure Paystack payment</li>
                <li className="flex items-center gap-1.5"><Smartphone size="1.1em" className="text-sky" aria-hidden="true" /> Ticket on your phone</li>
              </ul>
            </div>
          </div>

          <div className="animate-[fade-up_0.8s_var(--ease-out)_0.2s_both]">
            <SearchPanel />
          </div>
        </div>
      </section>

      <CityMarquee />

      <FrequentRoutes />

      {/* ── Two ways to ride ─────────────────────────────────── */}
      <section className="px-6 pb-20 sm:pb-24" aria-labelledby="ride-heading">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 id="ride-heading" className="font-display text-4xl font-bold leading-tight text-asphalt sm:text-5xl">
              Travel <Scribble variant="circle" delay={200}>your</Scribble> way
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              {
                photo: PHOTOS.hiace,
                alt: 'Rear of a white Toyota HiAce bus',
                tag: 'Shared bus',
                title: 'Book a seat',
                copy: 'Ride with other passengers on a scheduled HiAce or coach. Pay only for the seats you need.',
                to: '/?type=individual#search',
                cta: 'Find a seat',
              },
              {
                photo: PHOTOS.couple,
                alt: 'A couple in matching pink traditional outfits',
                tag: 'Whole vehicle',
                title: 'Hire a whole bus',
                copy: 'For weddings, family trips, church or mosque events and staff travel. The bus is yours alone.',
                to: '/?type=private#search',
                cta: 'Hire a bus',
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 120}>
                <Link to={c.to} className="group relative block h-[420px] overflow-hidden rounded-3xl bg-asphalt sm:h-[480px]">
                  <img
                    src={img(c.photo, 900)}
                    alt={c.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-(--ease-out) group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-asphalt/90 via-asphalt/20 to-transparent" aria-hidden="true" />
                  <span className="absolute left-5 top-5 rounded-full bg-rose px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {c.tag}
                  </span>
                  <div className="absolute inset-x-4 bottom-4">
                  <LiquidGlass radius={22} tint="rgba(10,31,60,0.28)" className="p-5 text-white">
                    <h3 className="font-display text-2xl font-bold">{c.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-white/85">{c.copy}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                      {c.cta}
                      <ArrowRight size="1.1em" className="transition-transform duration-300 ease-(--ease-out) group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </LiquidGlass>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <UpcomingDepartures />

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-asphalt px-6 py-20 text-white sm:py-24" aria-labelledby="how-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={img(PHOTOS.window, 900, 1000)}
                alt="A smiling traveller leaning out of a bus window"
                loading="lazy"
                className="aspect-[9/10] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-4 [animation:float_6s_var(--ease-in-out)_infinite] sm:-right-6">
            <LiquidGlass radius={20} tint="rgba(255,255,255,0.18)" className="p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <Ticket size="1.1em" aria-hidden="true" /> Ticket ready
              </p>
              <p className="mt-1 font-mono text-xs text-white/85">Seat 12A · Kano → Abuja</p>
            </LiquidGlass>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <h2 id="how-heading" className="font-display text-4xl font-bold leading-tight sm:text-5xl">
                Three steps to your <Scribble delay={200}>seat</Scribble>
              </h2>
            </Reveal>
            <ol className="mt-10 space-y-6">
              {STEPS.map(({ Icon, title, copy }, i) => (
                <Reveal as="li" key={title} delay={i * 110} className="flex gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose font-display text-2xl font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-xl font-bold">
                      {title} <Icon size="0.9em" className="text-sky" aria-hidden="true" />
                    </h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-white/75">{copy}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Ticket on your phone ─────────────────────────────── */}
      <section className="px-6 py-20 sm:py-24" aria-labelledby="phone-heading">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-wider text-rose">After you book</p>
            <h2 id="phone-heading" className="mt-2 font-display text-4xl font-bold leading-tight text-asphalt sm:text-5xl">
              Your whole trip, in your <Scribble variant="underline" delay={200}>pocket</Scribble>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate">
              Your ticket shows your seat, route and booking reference. Show it at
              the terminal or print it — and manage the trip from the same place.
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {AFTER.map(({ Icon, title, copy }) => (
                <li key={title} className="flex gap-4 rounded-2xl bg-paper-dim p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danfo text-white">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold text-asphalt">{title}</h3>
                    <p className="mt-0.5 text-sm text-slate">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="overflow-hidden rounded-3xl bg-rose">
              <img
                src={img(PHOTOS.phone, 900, 1000)}
                alt="A woman smiling at her phone"
                loading="lazy"
                className="aspect-[9/10] w-full object-cover"
              />
            </div>
            <span className="absolute -left-3 top-8 rotate-[-6deg] rounded-full bg-danfo px-4 py-2 text-sm font-bold text-white shadow-lg [animation:float_7s_var(--ease-in-out)_infinite]">
              Show it at the terminal
            </span>
          </Reveal>
        </div>
      </section>

      {/* ── Closing call to action ───────────────────────────── */}
      <section className="px-6 pb-4">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-asphalt">
          <img
            src={img(PHOTOS.traveller, 1600)}
            alt=""
            loading="lazy"
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-asphalt via-asphalt/80 to-asphalt/10" aria-hidden="true" />
          <div className="max-w-xl px-8 py-16 text-white sm:px-14 sm:py-24">
            <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
              Your next trip <Scribble delay={200}>starts</Scribble> here.
            </h2>
            <p className="mt-4 text-lg text-white/80">Pick a route, choose a seat and travel.</p>
            <a
              href="#search"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-7 py-4 text-base font-bold text-white transition-[background-color,transform] duration-200 ease-(--ease-out) hover:-translate-y-0.5 hover:bg-rose-dark"
            >
              Book your seat <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

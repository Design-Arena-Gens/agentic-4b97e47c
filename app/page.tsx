'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import {
  generateCampaignPlan,
  CampaignPlan,
  campaignSchema
} from '../lib/campaignPlanner';
import {
  defaultPlatformOrder,
  platformProfiles,
  PlatformKey
} from '../lib/platforms';

interface FormState {
  brandName: string;
  brandVoice: string;
  heroDestinations: string;
  signatureExperience: string;
  guestPersona: string;
  travelSeason: string;
  differentiator: string;
  vipOffer: string;
  startDate: string;
  campaignLength: number;
  primaryPlatforms: PlatformKey[];
  cadenceIntensity: 'calm' | 'balanced' | 'high';
}

const defaultState: FormState = {
  brandName: 'Lumina Voyage Atelier',
  brandVoice: 'Quietly opulent, anticipatory, sophisticated',
  heroDestinations: 'Amalfi Coast; Maldives atoll; Kyoto bamboo retreats',
  signatureExperience: 'Door-to-dome private jet transfer paired with a 48-hour superyacht prologue',
  guestPersona: 'Ultra-high-net-worth families and inward-focused power couples',
  travelSeason: 'Summer',
  differentiator: 'Predictive concierge intelligence that scripts every micro-moment before arrival',
  vipOffer: 'Complimentary fragrance sommelier and 36-hour itinerary hold',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  campaignLength: 21,
  primaryPlatforms: ['instagram', 'facebook', 'linkedin'],
  cadenceIntensity: 'balanced'
};

function tokenizeDestinations(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toCampaignPayload(state: FormState) {
  const payload = {
    ...state,
    heroDestinations: tokenizeDestinations(state.heroDestinations),
    campaignLength: Number(state.campaignLength),
    startDate: new Date(state.startDate).toISOString()
  };

  return campaignSchema.parse(payload);
}

function downloadCsv(plan: CampaignPlan) {
  const headers = [
    'Platform',
    'Posting Date',
    'Recommended Window',
    'Title',
    'Caption',
    'Asset Direction',
    'Call To Action',
    'Hashtags',
    'Concierge Touch'
  ];

  const lines = plan.posts.map((post) =>
    [
      platformProfiles[post.platform].label,
      post.postingDate,
      post.postingWindow,
      post.title,
      post.caption.replace(/\n/g, ' '),
      post.assetDirection,
      post.callToAction,
      post.hashtags.join(' '),
      post.conciergeTouch
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(',')
  );

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', 'luxury-travel-campaign.csv');
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function HomePage() {
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [plan, setPlan] = useState<CampaignPlan>(() => generateCampaignPlan(toCampaignPayload(defaultState)));
  const [isGenerating, setIsGenerating] = useState(false);

  const platformSelections = useMemo(() => defaultPlatformOrder, []);

  const handleChange = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'campaignLength' ? Number(event.target.value) : event.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: PlatformKey) => {
    setFormState((prev) => {
      const exists = prev.primaryPlatforms.includes(platform);
      if (exists) {
        const filtered = prev.primaryPlatforms.filter((item) => item !== platform);
        return { ...prev, primaryPlatforms: filtered.length ? filtered : prev.primaryPlatforms };
      }
      return { ...prev, primaryPlatforms: [...prev.primaryPlatforms, platform] };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    requestAnimationFrame(() => {
      const payload = toCampaignPayload(formState);
      const nextPlan = generateCampaignPlan(payload);
      setPlan(nextPlan);
      setIsGenerating(false);
    });
  };

  return (
    <main className="px-6 pb-24">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 pt-16">
        <header className="flex flex-col gap-6 text-left">
          <div className="selection-bubble w-fit">LUXURY SOCIAL AUTOMATION SUITE</div>
          <h1 className="gradient-text text-4xl font-semibold leading-tight md:text-5xl">
            Conjure couture travel narratives and deploy them at peak resonance.
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            Lumina Voyage Studio assembles concierge-grade social content, synchronises posting windows, and
            scripts engagement rituals for multi-platform dominance.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-white/50">
            <span className="badge">Predictive Posting Cadence</span>
            <span className="badge">Concierge Messaging Scripts</span>
            <span className="badge">Executive-ready Exports</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="card card-gradient border-white/10 p-8 shadow-2xl shadow-brand-500/10 md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span>Brand Identity</span>
              <input value={formState.brandName} onChange={handleChange('brandName')} placeholder="Brand name" />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Voice & Vibe</span>
              <input value={formState.brandVoice} onChange={handleChange('brandVoice')} placeholder="E.g. Quietly opulent" />
            </label>
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>Flagship Destinations</span>
              <textarea
                value={formState.heroDestinations}
                onChange={handleChange('heroDestinations')}
                rows={2}
                placeholder="Separate with commas or new lines"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>Signature Experience</span>
              <textarea value={formState.signatureExperience} onChange={handleChange('signatureExperience')} rows={2} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Guest Persona</span>
              <input value={formState.guestPersona} onChange={handleChange('guestPersona')} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>Seasonal Focus</span>
              <select value={formState.travelSeason} onChange={handleChange('travelSeason')}>
                {['Spring', 'Summer', 'Autumn', 'Winter', 'Evergreen'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>Signature Differentiator</span>
              <textarea value={formState.differentiator} onChange={handleChange('differentiator')} rows={2} />
            </label>
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span>VIP Offer Hook</span>
              <textarea value={formState.vipOffer} onChange={handleChange('vipOffer')} rows={2} />
            </label>
          </div>

          <div className="card-divider" />

          <div className="grid gap-6 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm">
              <span>Campaign Start</span>
              <input type="date" value={formState.startDate} onChange={handleChange('startDate')} />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span>
                Duration <span className="text-white/40">({formState.campaignLength} days)</span>
              </span>
              <input
                type="range"
                min={7}
                max={45}
                step={1}
                value={formState.campaignLength}
                onChange={handleChange('campaignLength')}
              />
            </label>
            <div className="flex flex-col gap-2 text-sm">
              <span>Cadence Intensity</span>
              <div className="flex gap-2">
                {(['calm', 'balanced', 'high'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormState((prev) => ({ ...prev, cadenceIntensity: option }))}
                    className={clsx('secondary w-full text-xs uppercase tracking-widest', {
                      'bg-brand-500': formState.cadenceIntensity === option,
                      'hover:bg-brand-500/70': formState.cadenceIntensity === option
                    })}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card-divider" />

          <div className="flex flex-col gap-3">
            <span className="text-sm">Priority Platforms</span>
            <div className="grid-auto-fit">
              {platformSelections.map((platform) => {
                const profile = platformProfiles[platform];
                const active = formState.primaryPlatforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={clsx('card border px-5 py-4 text-left transition', active ? 'border-brand-400 bg-white/15' : 'hover:bg-white/10')}
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{profile.label}</span>
                      <span className="text-xs text-white/50">{profile.cadencePerWeek}x weekly</span>
                    </div>
                    <p className="mt-2 text-xs text-white/60">{profile.audienceMood}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-divider" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-white/40">Outputs refresh instantly with each generation.</div>
            <div className="flex gap-3">
              <button type="button" className="secondary" onClick={() => downloadCsv(plan)}>
                Export CSV
              </button>
              <button type="submit" className="primary">
                {isGenerating ? 'Calibrating…' : 'Generate Launch Map'}
              </button>
            </div>
          </div>
        </form>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="card card-gradient border border-white/10 p-8">
            <h2 className="section-title mb-6">Executive Capsule</h2>
            <div className="flex flex-col gap-4 text-sm text-white/70">
              <p className="text-base text-white">{plan.executiveSummary}</p>
              <p>{plan.heroStatement}</p>
              <p>{plan.performanceNorthStar}</p>
              <div>
                <h3 className="text-xs font-semibold uppercase text-white/40">Content Pillars</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5">
                  {plan.contentPillars.map((pillar) => (
                    <li key={pillar}>{pillar}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="card border border-white/10 p-8">
            <h2 className="section-title mb-6">Measurement Pulse</h2>
            <ul className="space-y-3 text-sm text-white/70">
              {plan.measurementPulse.map((metric) => (
                <li key={metric} className="rounded-2xl bg-white/5 px-4 py-3">
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card border border-white/10 p-8">
          <h2 className="section-title mb-4">Platform Field Notes</h2>
          <div className="grid-auto-fit">
            {formState.primaryPlatforms.map((platform) => (
              <div key={platform} className="rounded-3xl bg-white/5 p-5 text-sm text-white/70">
                <div className="mb-2 flex items-center justify-between text-white">
                  <span className="font-medium">{platformProfiles[platform].label}</span>
                  <span className="text-xs text-white/50">{platformProfiles[platform].cadencePerWeek}x weekly</span>
                </div>
                <p>{plan.platformInsights[platform]}</p>
                <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">Creative Prompts</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {platformProfiles[platform].assetGuidance.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/40">Hashtags</div>
                <p className="mt-2 text-xs text-white/60">{platformProfiles[platform].hashtagBuckets.join(' · ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card border border-white/10 p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="section-title">Publishing Runway</h2>
            <span className="text-xs text-white/50">Optimised windows across {plan.posts.length} activations</span>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {plan.posts.slice(0, 24).map((post) => (
              <article key={post.id} className="rounded-3xl bg-white/5 p-5 text-sm text-white/75">
                <div className="flex flex-wrap items-center justify-between gap-2 text-white">
                  <span className="font-medium">{platformProfiles[post.platform].label}</span>
                  <span className="text-xs text-white/50">
                    {format(new Date(post.postingDate), 'EEE, MMM d')} · {post.postingWindow}
                  </span>
                </div>
                <p className="mt-3 text-white">{post.caption}</p>
                <div className="mt-4 flex flex-col gap-2 text-xs text-white/60">
                  <span>Asset: {post.assetDirection}</span>
                  <span>Mood: {post.mood}</span>
                  <span>CTA: {post.callToAction}</span>
                  <span>Concierge Move: {post.conciergeTouch}</span>
                  <span>Hashtags: {post.hashtags.join(' ')}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card border border-white/10 p-8">
          <h2 className="section-title">Concierge Engagement Rituals</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plan.engagementPlaybook.map((item) => (
              <div key={item.dayLabel} className="rounded-3xl bg-white/5 p-5 text-sm text-white/70">
                <div className="text-xs text-white/40">{item.dayLabel}</div>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {item.moves.map((move) => (
                    <li key={move}>{move}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

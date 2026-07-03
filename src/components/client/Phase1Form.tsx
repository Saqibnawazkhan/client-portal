import { useState } from 'react';
import { Field, SectionHead } from '../ui/Field';
import { ChipGroup } from '../ui/Chips';

/** Budget tiers per currency — pick the currency, the ranges follow. */
const CURRENCIES: Record<string, { symbol: string; tiers: string[] }> = {
  USD: { symbol: '$', tiers: ['Under $5k', '$5k – $15k', '$15k – $40k', '$40k+'] },
  GBP: { symbol: '£', tiers: ['Under £4k', '£4k – £12k', '£12k – £30k', '£30k+'] },
  EUR: { symbol: '€', tiers: ['Under €5k', '€5k – €14k', '€14k – €35k', '€35k+'] },
  PKR: { symbol: '₨', tiers: ['Under ₨1.5M', '₨1.5M – ₨4M', '₨4M – ₨10M', '₨10M+'] },
  AED: { symbol: 'AED', tiers: ['Under AED 18k', 'AED 18k – 55k', 'AED 55k – 150k', 'AED 150k+'] },
};
const CURRENCY_CODES = Object.keys(CURRENCIES);

const TIMELINE = ['As soon as possible', 'In 2–4 weeks', 'In 4–8 weeks', 'In 8–12 weeks', 'Just exploring'];

export function Phase1Form() {
  const [currency, setCurrency] = useState('USD');
  const budgetOptions = [...CURRENCIES[currency].tiers, 'Not sure yet'];

  return (
    <div>
      <section className="form-sec">
        <SectionHead n={1} title="About you" />
        <div className="grid grid-2">
          <Field label="Your name">
            <input className="input" name="Your name" placeholder="e.g. Ayesha Khan" required />
          </Field>
          <Field label="Company or brand">
            <input className="input" name="Company or brand" placeholder="e.g. Lumen Skincare" />
          </Field>
          <Field label="Email">
            <input className="input" name="Email" type="email" placeholder="you@company.com" required />
          </Field>
          <Field label="Phone or WhatsApp" optional>
            <input className="input" name="Phone or WhatsApp" placeholder="+92 300 0000000" />
          </Field>
          <Field label="Best way to reach you" full>
            <ChipGroup name="Best way to reach you" options={['Email', 'Phone', 'WhatsApp']} defaultValue="Email" />
          </Field>
        </div>
      </section>

      <section className="form-sec">
        <SectionHead n={2} title="About your project" />
        <div className="grid grid-2">
          <Field label="What can we help you build?" full>
            <ChipGroup
              name="What can we help you build?"
              options={['A website', 'A mobile app', 'An AI chatbot', 'Design / branding', 'Something else']}
              defaultValue="A website"
            />
          </Field>

          <Field label="Tell us about your project" full help="A sentence or two is perfect — no jargon needed.">
            <textarea
              className="textarea"
              name="Tell us about your project"
              placeholder="What are you hoping to build, and why now?"
            />
          </Field>

          <Field
            label="What would make this a success?"
            full
            optional
            help="More customers? A fresh look? Less manual work? Tell us what a win looks like."
          >
            <textarea className="textarea" name="What would make this a success?" placeholder="A win for us would be…" />
          </Field>

          <Field label="Rough budget" help="A ballpark is fine — it just helps us suggest the right approach.">
            <div className="budget-control">
              <label className="currency-pick">
                <span className="currency-pick-label">Currency</span>
                <select
                  className="select currency-select"
                  name="Budget currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  aria-label="Budget currency"
                >
                  {CURRENCY_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCIES[c].symbol})
                    </option>
                  ))}
                </select>
              </label>
              {/* key forces a reset to a clean default when the currency changes */}
              <ChipGroup key={currency} name="Rough budget" options={budgetOptions} defaultValue="Not sure yet" />
            </div>
          </Field>

          <Field label="Ideal timeline">
            <ChipGroup name="Ideal timeline" options={TIMELINE} defaultValue="Just exploring" />
          </Field>
        </div>
      </section>
    </div>
  );
}

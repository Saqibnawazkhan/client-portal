import { Field, SectionHead } from '../ui/Field';
import { ChipGroup } from '../ui/Chips';

const VIBES = ['Minimal', 'Bold', 'Playful', 'Elegant', 'Modern', 'Classic', 'Friendly', 'Premium'];
const READY = [
  'A logo',
  'Photos or images',
  'Written text / content',
  'A web address (like yourbusiness.com)',
  "Nothing yet — that's okay",
];

export function Phase2Form() {
  return (
    <div>
      <section className="form-sec">
        <SectionHead n={1} title="Who it's for" />
        <div className="grid grid-2">
          <Field
            label="Who are your customers?"
            full
            help="Describe the people you want to reach — e.g. busy parents, local shoppers, small businesses."
          >
            <textarea className="textarea" name="Who are your customers?" placeholder="Our customers are…" />
          </Field>
          <Field label="Do you have a website already?" full optional>
            <input className="input" name="Current website" placeholder="Paste the link, or leave blank" />
          </Field>
        </div>
      </section>

      <section className="form-sec">
        <SectionHead n={2} title="The look & feel" />
        <Field label="Pick your vibe" help="Choose a few words that feel right — we'll take it from there.">
          <ChipGroup name="Vibe" options={VIBES} multi />
        </Field>

        <div className="grid grid-2" style={{ marginTop: 18 }}>
          <Field
            label="Websites or brands you love"
            full
            optional
            help="Paste a couple of links, or just name brands whose style you admire."
          >
            <textarea className="textarea" name="Websites or brands you love" placeholder="I really like…" />
          </Field>
          <Field label="Your brand colors" optional help="Skip if you're not sure — we'll help you choose.">
            <input className="input" name="Brand colors" placeholder="e.g. warm orange & charcoal" />
          </Field>
          <Field label="Anything to avoid?" optional>
            <input className="input" name="Things to avoid" placeholder="e.g. nothing too corporate" />
          </Field>
        </div>
      </section>

      <section className="form-sec">
        <SectionHead n={3} title="What do you already have?" />
        <p className="sec-sub">Tick anything that's ready — no problem if it's nothing yet.</p>
        <div className="stack" style={{ gap: 10 }}>
          {READY.map((item) => (
            <label className="check-row" key={item}>
              <input type="checkbox" name="Ready" value={item} />
              {item}
            </label>
          ))}
        </div>
      </section>

      <section className="form-sec">
        <SectionHead n={4} title="Anything else?" />
        <Field label="Is there anything else we should know?" optional>
          <textarea
            className="textarea"
            name="Anything else"
            placeholder="Big dreams, worries, must-haves — tell us anything on your mind."
          />
        </Field>
      </section>
    </div>
  );
}

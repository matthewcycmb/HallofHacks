import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { guideJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "How to Win a Hackathon",
  description:
    "What actually wins hackathons, drawn from dozens of grand-prize and finalist projects: pick a real problem, make the demo work for real, and give judges something they remember.",
  alternates: { canonical: "/guide" },
};

export default function GuidePage() {
  return (
    <article className="mx-auto w-full max-w-[680px] px-[clamp(20px,4vw,48px)] pb-[140px] pt-10 leading-relaxed">
      <JsonLd data={guideJsonLd()} />
      <h1 className="text-[28px] font-bold tracking-[-0.015em] sm:text-[34px]">
        How to win a hackathon
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        We&rsquo;ve read through dozens of grand-prize and finalist projects to build this
        archive. The winners almost never have the most code or the fanciest tech. They share a
        handful of habits, and you can copy every one of them.
      </p>

      <div className="mt-8 flex flex-col gap-7 text-[15.5px] leading-[1.65] text-ink-soft [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:tracking-[-0.01em] [&_h2]:text-ink">
        <section className="flex flex-col gap-2">
          <h2>1. Solve a real problem, ideally one you actually have</h2>
          <p>
            The most convincing projects fix something the team genuinely needed fixed. When one
            team showed up to a hackathon with{" "}
            <Link href="/project/dial-4rqzc3">nowhere to sleep, they built bots that phoned real
            hotels</Link>{" "}
            and booked them a room that night. Pick a problem you can describe to a stranger in
            one breath. If it&rsquo;s a problem you have, you&rsquo;ll demo it like you mean it.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>2. Make the demo actually work, live</h2>
          <p>
            Most hackathon demos are faked or run on canned data. The ones that win do something
            real in the room. A project that{" "}
            <Link href="/project/project-lend">actually delivered 100 pounds of food to real
            shelters</Link>{" "}
            over the weekend is impossible to argue with. Build the one thing that works for
            real, even if everything around it is held together with tape.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>3. Pick an idea people understand in one sentence</h2>
          <p>
            If a judge can&rsquo;t repeat your idea to the next judge, it loses. &ldquo;
            <Link href="/project/facetime-macos-ai-agent">You FaceTime your own computer and tell
            it what to do</Link>&rdquo; needs no explanation. Neither does &ldquo;
            <Link href="/project/yes-or-yes">real fish pick your decisions</Link>.&rdquo; Write
            your one sentence first. If it needs a setup paragraph, simplify the project.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>4. Use something familiar in a way nobody expects</h2>
          <p>
            You don&rsquo;t need new technology, you need a surprising use of the familiar. One
            team{" "}
            <Link href="/project/maestro-n0uqyz">pointed a camera at a broom and played it like a
            guitar</Link>. The wow comes from the gap between &ldquo;I know what that is&rdquo;
            and &ldquo;wait, it does that?&rdquo; Take something everyone already uses and give it
            a job it was never meant for.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>5. Do the opposite of the obvious</h2>
          <p>
            When everyone solves a problem the same way, the winning move is often to flip it.
            Every smart cane buzzes to warn a blind person about obstacles;{" "}
            <Link href="/project/raising-cane">Shepherd instead steers them toward the open
            path</Link>, like a guide dog. Look at how your problem is normally solved, then ask
            what the reverse would look like.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>6. Scope it tiny and finish</h2>
          <p>
            A small thing that fully works beats an ambitious thing that half-works. Turning a{" "}
            <Link href="/project/screwyouikea">confusing IKEA manual into a 3D animation you can
            spin around</Link>{" "}
            is a tight, finished idea, not a platform. Cut your plan in half, then in half again,
            until you&rsquo;re sure you can finish and still have time to practice the demo.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>7. Give the judges something to feel</h2>
          <p>
            Judges remember projects that make them feel something. A safety app{" "}
            <Link href="/project/wing-cet3o0">disguised as a weather app so an abuser
            won&rsquo;t find it</Link>, or a robot that{" "}
            <Link href="/project/heartstart">does CPR while the ambulance is on the way</Link>,
            lands because there&rsquo;s a real person on the other side. Make it clear who this is
            for and why it matters to them.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2>8. Spend the last hours on the demo, not the code</h2>
          <p>
            You win on the two-minute demo, not the codebase. Have a clean story: the problem,
            the one moment where your thing does the impossible-looking part, and the result.
            Practice it out loud. A working demo with a sharp story beats a deeper project that
            crashes or rambles.
          </p>
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-7">
          <p>
            The best way to internalize all of this is to see it. Browse{" "}
            <Link href="/feed">the archive of winning hackathon projects</Link> and read what made
            each one win. Patterns jump out fast, and the next idea is usually hiding in there.
          </p>
        </section>
      </div>
    </article>
  );
}

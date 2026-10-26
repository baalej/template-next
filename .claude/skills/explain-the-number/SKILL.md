---
name: explain-the-number
description: "Apply before you trust, report, or act on any number you measured: a speedup, a regression, a latency, a throughput, a benchmark or an eval score. Name what limits it, and rule out that you measured something other than the work you think you measured."
disable-model-invocation: true
---

# Explain the Number

**Rule:** A measurement you cannot explain is not evidence. Before a number leaves your hands — into a reply, a commit message, or a decision — name the thing that bounds it and rule out the ways it could be measuring something else. An unexplained number is a guess wearing a decimal point.

**When to apply:** After any measurement, and before reporting a speedup, a regression, a latency, a throughput figure, or an eval result. Also when someone hands *you* a number and asks you to act on it.

## 1. Ask "why not twice as good?"

Name the resource or code path that bounds the result: a core, a lock, the disk, the network, an upstream service, or the load generator itself. Get it from a profile or from system counters captured *during* the run, then map it back to source.

Reading the code and reasoning about what *should* be slow does not produce a limiter. It produces a hypothesis.

**If you cannot say why the number is not twice as good, you do not know what you measured.** That is the whole test, and it is uncomfortable on purpose.

## 2. List what else the number could be

Write the list, then rule each one out with evidence. The usual suspects:

- **Errors.** The fast path was a failure path. Check status codes and error counts, not just timing.
- **Skipped or cached work.** The second run read a warm cache, a memoized value, or a build artifact.
- **Code that never ran.** Dead config, a feature flag off, an early return.
- **The wrong environment.** You measured the local dev server, and production is what matters. Caching, compression, CDN and server software often differ between the two (nginx locally, LiteSpeed behind a CDN in production). Check production read-only, or say where you measured.
- **An untuned comparison.** One side on defaults and the other tuned is not a comparison.
- **Noise.** One run is an anecdote. Thermal state, a neighbour process, and background indexing all show up as wins.
- **A piece too small to matter.** A 40% gain in something that is 2% of the work is a 0.8% gain. If the time saved exceeds the time the changed code took, you measured something else.

## 3. Keep the evidence attached to the number

Run count, the spread across runs, the workload, and the named limiter. In the notes, the commit message, or a linked artifact — wherever the number goes, these go with it.

A number with no spread is not reproducible and should not be reported as a fact. Report the range.

## Across kinds of measurement

**Performance.** Same workload on both sides, stated explicitly. A speedup against a different input is not a speedup.

**Evals and scored runs.** Ask the same questions of the trials: did every run actually perform the task, does the gap hold across repeated trials, and does the scenario resemble the thing you care about. A gap inside the run-to-run spread is not a gap.

**The sign you skipped this:** a number in your report with no run count, no spread, or no named limiter. Or a time saved that is larger than the time the changed code ever took.

---

## Related

The measurement arm of [Quality Over Speed](../quality-over-speed/SKILL.md). That principle rejects "it compiles"; this one rejects "it got faster".

Supplies the labels in astack-mode's **Evidence** section with their teeth. A number is only *measured* once you can name its limiter. Until then it is inferred at best.

Distinct from [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md), which traces a fault to its origin. This traces a *number* to its cause — and the two meet when an optimization "works" for a reason you never identified, which means it can stop working for a reason you will not predict.

When the limiter is a structure rather than a resource, see [Foundational Thinking](../foundational-thinking/SKILL.md) and [Model the Domain](../model-the-domain/SKILL.md). The most common true limiter is a data shape that forces the wrong access pattern, and no amount of tuning moves it.

Make the measurement rerunnable rather than hand-timed, per [Build the Lever](../build-the-lever/SKILL.md). A number a reviewer can reproduce beats a number they have to believe.

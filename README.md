# UI Prototype for Google Play Niche Discovery SaaS

## Project Context

This repository contains the frontend for my own SaaS prototype.

It was built as a **fast experimental UI layer** for a prototype backend service whose purpose was to explore Google Play niches, keyword structures, and early market signals. The goal of this project was not to build a polished production-ready interface from the start, but to create a usable internal product shell that made the backend workflow easier to test, inspect, and iterate on.

This frontend was intentionally created in rapid MVP mode. The priority was speed of execution, validation of product ideas, and quick iteration on user flows — not final design-system maturity or long-term frontend architecture.

In simple terms: this was a **prototype UI for a prototype backend**.

Backend repository: **[github.com/vasreb/mceli-keys](github.com/vasreb/mceli-keys)**

---

## What This Project Was For

The UI was designed to support a backend pipeline that worked with:

- manually defined topic seeds,
- Google Play search result snapshots,
- root keyword extraction,
- long-tail keyword variants,
- SERP-based clustering,
- and lightweight niche-level proxy metrics.

The frontend's role was to make these pipeline stages visible and manageable, so the product idea could be validated faster.

---

## Why the Codebase Looks Like a Prototype

This repository reflects a founder-style MVP mindset.

The product itself was still being validated, so it did not make sense to spend disproportionate time on perfect abstraction layers, enterprise-grade architecture, or heavy refactoring too early. The main objective was to get a working interface over the backend prototype, observe how the workflow felt in practice, and quickly improve only the parts that mattered most for learning.

Because of that, this project should be viewed as:

- a fast-moving prototype,
- built to validate workflow and usability,
- rather than a finalized UI platform.

---

## Tech Stack

This UI prototype was built with:

- **TypeScript**
- **React**
- **TanStack Table**
- **MobX**
- **TanStack Router**
- **RSBuild**
- **SCSS Modules**
- **React Hook Form**
- **Material UI 5**

---

## What the UI Covered

Depending on the stage of the prototype, the interface was intended to support workflows such as:

- viewing and managing seeds,
- inspecting generated base queries,
- reviewing Google Play SERP snapshots,
- exploring extracted roots and linked variants,
- browsing keyword clusters,
- and looking at initial proxy metrics before deeper market analysis.

The exact implementation details could evolve quickly because the product itself was still being shaped.

---

## Product and Engineering Trade-Offs

This project intentionally favored:

- fast feature delivery,
- simple iteration loops,
- practical usability,
- and direct integration with the backend prototype,

over:

- ideal long-term architecture,
- exhaustive reusable abstractions,
- or fully standardized UI patterns across the whole app.

That was a conscious product decision, not an accident.

For an MVP at this stage, the most important thing was to test whether the overall workflow was useful and commercially interesting.

---

## How to Evaluate This Repository

The most accurate way to understand this codebase is to evaluate it as:

- a practical prototype UI,
- built on top of a prototype backend,
- created to validate a SaaS idea quickly,
- using a modern React-based stack,
- with a focus on shipping and learning rather than polishing.

If this product had moved beyond the validation stage, the next step would naturally have been to harden the architecture, normalize patterns, improve consistency, and prepare the interface for long-term maintainability.

---

## Backend

This frontend was created to work together with the backend prototype:

**Backend repository:** [LINK_TO_BACKEND_REPO](LINK_TO_BACKEND_REPO)

Replace the placeholder above with the actual repository URL.

---

## Possible Next Improvements

If the prototype had continued into a more mature product stage, the next improvements would likely include:

- stronger domain boundaries in the frontend,
- more standardized state and data-access patterns,
- reusable UI primitives for repeated flows,
- stronger validation and error-state handling,
- better test coverage,
- and broader production hardening.

Those were intentionally not the first priority during the hypothesis-validation stage.

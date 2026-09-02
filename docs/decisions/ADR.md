# Decision Register

Append-only. Governed by the System Governance Specification §3.

**Rules:** Entries are never edited, truncated, or removed (§3.3). To reverse a
decision, append a new entry that explicitly references and invalidates the prior
ID. Entries are written **before** the code they authorize (§3.1, §3.4). Every
entry that changes code carries a `// Governance-Ref: ADR-XXXX` marker at the site
where the change manifests (§4.1).

**Marker status legend:** `Requires Marker` = a code marker must exist in the repo
for this ADR or the build fails (§4.2). `Planning Only` = no code yet.

---

## ADR-0001 — Add caption fields to StepImage

- **Timestamp:** 2026-09-02T12:37:08Z
- **Clause/Contract Affected:** §2.2 (Immutable Baseline), §2.3 (Justified Schema
  Refinement) — entity `HowToDoItApp.Models.StepImage`
- **Marker status:** Requires Marker — `HowToDoItApp/Models/StepImage.cs` and the
  EF migration that adds the columns
- **Status:** Accepted, not yet implemented

### Problem

The product requirement is that an uploaded photo receives a 1–2 sentence
model-written summary, and that the summary stays editable. The pre-authored data
scaffold has no field capable of holding it. `WorkStep.Description` is step-scoped,
not image-scoped, and a step may hold many images; storing per-image text there
would overload an existing authored column with a second meaning. This is a
domain-level gap, not implementation convenience — §2.2 rejects convenience as
grounds, and this is not that.

### Options Analyzed

**Option A — Overload `WorkStep.Description`** *(rejected)*
- *Architectural Mechanics:* Concatenate per-image summaries into the existing step
  description; no schema change.
- *Advantages & Alignment:* Zero schema departure. No migration. Ships fastest.
- *Disadvantages & Operational Risk:* Destroys the 1:1 image→summary relation the
  requirement states. Cannot render a caption under its own image. Cannot detect
  which text a human edited. Silently overloads an existing authored field. Makes
  the "model must not overwrite human edits" negative assertion (§4.3) unwritable.

**Option B — Sidecar `StepImageCaption` table** *(rejected)*
- *Architectural Mechanics:* New entity with a 1:1 FK to `StepImage`.
- *Advantages & Alignment:* Leaves `StepImage` byte-identical. Room to grow into
  caption history/versioning later.
- *Disadvantages & Operational Risk:* A 1:1 sidecar is a heavier departure than two
  columns, not a lighter one — it adds an entity, a repository, a join on every
  read path, and a cascade rule. `GetByStepId` becomes an `Include`. That
  complexity is not repaid by any requirement on the table today.

**Option C — Two nullable columns on `StepImage`** `[RECOMMENDED]`
- *Architectural Mechanics:* Add `Caption` (`nvarchar(500)`, null) and
  `IsCaptionAiGenerated` (`bit`, default `0`). Ordering reuses the **existing**
  `SortOrder` column and the existing `PATCH /api/StepImages/order` endpoint — no
  new field for sequence.
- *Advantages & Alignment:* Smallest change that satisfies the requirement. The
  caption travels with the image on every existing read path with no join.
  `IsCaptionAiGenerated` is what makes the §4.3 negative assertion expressible:
  re-running analysis may touch a caption **only** where this flag is true or the
  caption is null, so a human edit is provably never clobbered.
- *Disadvantages & Operational Risk:* Widens an authoritative entity by two
  columns; requires an EF migration against the shared physical database. Two
  columns is two columns of permanent surface.

### Selection

**Option C.** The `IsCaptionAiGenerated` flag is not decoration — without it there
is no mechanical way to prove the model never overwrote authored text, which §4.3
requires as a negative assertion.

### Trade-Off & Consequence

- **Gained:** Per-image summaries; provable protection of human edits; no new join.
- **Surrendered:** `StepImage` is no longer identical to its pre-authored form.
- **Admitted debt/risk:** A caption longer than 500 characters is rejected rather
  than truncated — a model that ignores the length instruction produces a
  validation failure, not silent data loss. The migration runs against a database
  shared with the separate Household app; it must be confirmed scoped to the
  `howtodoit` schema before it is applied.

---

## ADR-0002 — Host the vision model on Azure AI Foundry

- **Timestamp:** 2026-09-02T12:37:08Z
- **Clause/Contract Affected:** §8.2 (Boundary Thresholds — new infrastructure),
  §10.1 (Ingestion Registration)
- **Marker status:** Planning Only
- **Status:** Accepted, **conditional on the verification gate below**

### Problem

Caption and ordering require a Qwen vision-language model. It must be reachable
from the .NET API running in Azure App Service, and user photographs must be sent
to it.

### Options Analyzed

**Option A — Azure AI Foundry** `[RECOMMENDED]`
- *Architectural Mechanics:* Deploy a Qwen vision model in an AI Foundry project in
  the existing subscription; call it from the API over the Azure AI Inference SDK
  using the App Service managed identity.
- *Advantages & Alignment:* No API key exists to leak — which converts the §4.3
  "secrets absent from build outputs/logs" assertion from a scanning problem into a
  structural guarantee. Photos never leave the Azure tenant or the existing
  compliance boundary. One `infra/main.bicep` change. Single vendor, single bill.
- *Disadvantages & Operational Risk:* **Model availability is unverified.** Qwen
  vision model presence, exact deployment name, region, and quota in this
  subscription have not been confirmed. Foundry may lag first-party Qwen releases.

**Option B — Alibaba DashScope API** *(rejected)*
- *Architectural Mechanics:* HTTPS calls to `dashscope.aliyuncs.com` with an API key
  held in Key Vault.
- *Advantages & Alignment:* First-party Qwen; newest models guaranteed; no new Azure
  resource; simple REST.
- *Disadvantages & Operational Risk:* Introduces a second cloud vendor and a
  long-lived secret. Sends user photographs across a jurisdictional border, which is
  an App Store privacy-disclosure obligation and a materially larger question than a
  technical integration.

**Option C — Self-hosted Qwen2.5-VL on vLLM** *(rejected for now)*
- *Architectural Mechanics:* GPU Container App serving an OpenAI-compatible endpoint
  on the internal network.
- *Advantages & Alignment:* No per-call cost, no data egress, full version control.
- *Disadvantages & Operational Risk:* A GPU container is the single largest cost and
  operations line item in this plan, incurred before one caption is proven useful.
  Wrong order of investment for an unvalidated feature.

### Selection

**Option A**, gated. Option B is the fallback if the gate fails.

### Trade-Off & Consequence

- **Gained:** No stored secret; no cross-tenant photo egress; one vendor.
- **Surrendered:** Access to Qwen releases Foundry has not yet catalogued.
- **Admitted debt/risk:** **This ADR is conditional.** Task 1.0 of the plan is to
  verify a Qwen vision model is actually deployable in this subscription and region.
  If it is not, this decision is invalidated by a superseding ADR selecting Option
  B — it is not quietly reinterpreted (§1.2). Model weight licensing is unverified
  and logged as Owed Provenance Debt (F-0003, §10.2), which blocks production
  publish until cleared.

---

## ADR-0003 — Analysis runs as a separate endpoint, not inside upload

- **Timestamp:** 2026-09-02T12:37:08Z
- **Clause/Contract Affected:** §8.2 (Public API contract addition)
- **Marker status:** Requires Marker — the new controller action
- **Status:** Accepted, not yet implemented

### Problem

The requirement says summaries and ordering happen "automatically" on upload.
Ordering is only meaningful across a *set* of images, so it cannot be computed
inside any single-file upload request — which is exactly what
`POST /api/StepImages/upload` is.

### Options Analyzed

**Option A — Inline in `POST /api/StepImages/upload`** *(rejected)*
- *Architectural Mechanics:* Each upload call also invokes the model.
- *Advantages & Alignment:* Literally "on upload." No new endpoint or contract.
- *Disadvantages & Operational Risk:* Structurally cannot order a set — the endpoint
  sees one file. Couples upload durability to model availability, so a model outage
  becomes a photo-loss outage. Adds seconds of latency to every upload on a mobile
  connection.

**Option B — `POST /api/StepImages/analyze` fired once uploads settle** `[RECOMMENDED]`
- *Architectural Mechanics:* Uploads stay exactly as they are. The client fires a
  single `analyze { stepId }` once `Promise.all` over the uploads resolves. The
  endpoint captions every eligible image in the step, computes an order, persists
  through the existing repository, and returns the updated images. The client
  refetches; every field lands in the editors that already exist.
- *Advantages & Alignment:* Uploads keep their current reliability and latency. One
  model batch per step instead of N. Ordering receives the whole set, which is the
  only way it can work at all. Automatic from the user's view — the client fires it
  unprompted. Re-runnable after failure without re-uploading photos.
- *Disadvantages & Operational Risk:* Adds a public API endpoint (§8.2 — requires
  operator authorization). A client that uploads then closes the app leaves images
  uncaptioned until analysis is re-triggered.

**Option C — Background queue + hosted service** *(rejected for now)*
- *Architectural Mechanics:* Upload enqueues; a hosted service captions; the client
  polls or subscribes over SignalR.
- *Advantages & Alignment:* Most resilient. Survives client disconnect. Natural
  retry and backpressure.
- *Disadvantages & Operational Risk:* Requires a queue, a worker, and a client push
  channel — none of which exist today. Three new moving parts to caption photos for
  a single-writer application.

### Selection

**Option B.** Option C is the correct destination if volume ever justifies it, and
Option B's endpoint shape is a compatible stepping stone toward it.

### Trade-Off & Consequence

- **Gained:** Upload path untouched and still reliable; ordering becomes computable;
  failures are retryable without re-upload.
- **Surrendered:** Strict literal simultaneity with the upload request.
- **Admitted debt/risk:** An upload interrupted before analysis leaves images with
  null captions. This is a visible, recoverable state (a "Describe photos" action),
  not silent corruption — but it is a state the UI must handle explicitly.

---

## ADR-0004 — Two-stage inference: parallel captions, then one ordering pass

- **Timestamp:** 2026-09-02T12:37:08Z
- **Clause/Contract Affected:** §3.5 (design pattern selection), §7.1 (Mock
  Anti-Hallucination)
- **Marker status:** Requires Marker — the analysis service implementation
- **Status:** Accepted, not yet implemented

### Problem

Captioning and ordering are two different jobs over the same image set. How they
are split across model calls determines cost, latency, testability, and how badly
one bad model response can corrupt data.

**Governing constraint discovered during investigation:**
`HowToDoIt.ui/src/Helpers/compressImage.ts` re-encodes every photo through an HTML
canvas before upload. Canvas re-encoding does not carry EXIF forward, so
`DateTimeOriginal` is **already destroyed** by the time an image reaches the
server. Chronological ordering from capture metadata is not available to the
backend. Recorded as F-0001.

### Options Analyzed

**Option A — Single multimodal call returning captions + order as one JSON object** *(rejected)*
- *Architectural Mechanics:* Send all N images in one prompt; parse one response.
- *Advantages & Alignment:* One round trip. Ordering sees actual pixels, not just
  text about them. Cheapest in call count.
- *Disadvantages & Operational Risk:* One malformed response loses both captions and
  order. Latency scales with the slowest whole-batch response and cannot be
  parallelized. Large N risks context limits. Hardest to test — captions and
  ordering fail as a single opaque unit, which is precisely the shape §7.3 treats as
  a defect.

**Option B — Parallel per-image caption calls, then one text-only ordering call** `[RECOMMENDED]`
- *Architectural Mechanics:* Fan out N caption calls concurrently. Feed the
  resulting captions (text only, with image ids) into a second, cheap, text-only
  call that returns the ids in proposed order.
- *Advantages & Alignment:* Captions parallelize, so wall-clock is roughly one call
  regardless of N. The two stages fail independently — a broken ordering response
  leaves captions intact and falls back to upload order. The ordering stage is
  text-only, so it is cheap and its unit test needs no image fixtures. Each stage is
  separately assertable, satisfying §7.1's demand that the mock verify the
  *outbound* payload.
- *Disadvantages & Operational Risk:* N+1 calls costs more than one. Ordering reasons
  over captions rather than pixels, so a detail the caption omitted cannot inform the
  order — caption quality becomes an input to ordering quality.

**Option C — Per-image captions + deterministic EXIF ordering** *(rejected — non-viable)*
- *Architectural Mechanics:* Caption per image; order by EXIF capture timestamp.
- *Advantages & Alignment:* Ordering would be free, instant, and perfectly
  deterministic. Capture time is genuinely the best ground truth for "photos taken in
  sequence."
- *Disadvantages & Operational Risk:* **Not implementable.** The input EXIF no longer
  exists at the server (F-0001). Recovering it would require changing the client to
  extract timestamps before compression and transmit them alongside — a larger
  contract change than the ordering call it replaces — and it would still be useless
  for photos picked from a library out of capture order.

### Selection

**Option B.** Option C is documented as non-viable rather than merely unattractive,
satisfying §3.5's requirement that a reduced viable set be explicitly justified.

### Trade-Off & Consequence

- **Gained:** Independent failure domains; parallel latency; two separately testable
  units; a cheap text-only ordering stage.
- **Surrendered:** Call-count efficiency; ordering's access to raw pixels.
- **Admitted debt/risk:** Cost scales linearly with image count. The analyze endpoint
  must therefore cap images per request (proposed: 20, rejected with `400`) so a
  single call cannot run up an unbounded model bill.

---

## ADR-0005 — React Native (Expo) as a second client, web SPA retained

- **Timestamp:** 2026-09-02T12:37:08Z
- **Clause/Contract Affected:** §8.2 (new build pipeline), §8.3 (Irreversible &
  Outward Actions — store submission), §10.1 (Ingestion Registration)
- **Marker status:** Planning Only
- **Status:** Accepted for Part 2, not yet implemented

### Problem

The application must reach iOS. `HowToDoIt.ui` is already React 18 + Vite, so the
brief's "make it a React app" is already satisfied for web; the real decision is the
iOS delivery vehicle.

### Options Analyzed

**Option A — Capacitor shell around the existing SPA** *(rejected)*
- *Architectural Mechanics:* Wrap the existing `build/` output in a native iOS
  container; native photo access via Capacitor plugins.
- *Advantages & Alignment:* One codebase. No rewrite. Fastest route to a store
  binary. All Part 1 work ships to iOS for free.
- *Disadvantages & Operational Risk:* Reordering steps and images by drag is the core
  interaction of this product, and web-in-a-webview gesture handling is where that
  feels worst. Ships the SPA's Bootstrap 4 / React Router 5 desktop-era assumptions
  onto a phone.

**Option B — React Native / Expo client sharing the API** `[RECOMMENDED]`
- *Architectural Mechanics:* New `HowToDoIt.mobile` Expo app in TypeScript against
  the same API. The web SPA remains the public browse surface.
- *Advantages & Alignment:* Native gesture handling for the reorder interactions that
  define the product. Native multi-select photo picker and camera. Real offline
  capture becomes achievable. The API is already client-agnostic and reads are
  anonymous, so the contract needs no reshaping.
- *Disadvantages & Operational Risk:* Two frontends to maintain in perpetuity — the
  single largest ongoing cost in this plan. MSAL has no first-party React Native
  package; auth must be rebuilt on `expo-auth-session` PKCE against the CIAM
  authority, with a new redirect URI registered in Entra.

**Option C — PWA only** *(rejected)*
- *Architectural Mechanics:* Service worker + manifest on the existing SPA.
- *Advantages & Alignment:* No Xcode, no Apple Developer account, no second codebase.
  Offline capture is achievable.
- *Disadvantages & Operational Risk:* Does not satisfy "deployed on iOS" — it is not
  in the App Store. iOS PWA support for background upload and camera remains
  materially weaker than native.

### Selection

**Option B**, with the web SPA explicitly retained for anonymous public browsing.

### Trade-Off & Consequence

- **Gained:** Native reorder gestures, native photo picker, a genuine App Store
  artifact, a path to offline capture.
- **Surrendered:** Single-codebase economics. Two clients now drift independently.
- **Admitted debt/risk:** Auth is a rewrite, not a port — `@azure/msal-browser` does
  not run on React Native. CORS is a web-only concern and native clients send no
  `Origin`; the existing origin allow-list must not be widened for mobile. How the
  TypeScript contract is shared between the two clients is **not decided here** and
  requires its own ADR before Part 2 code is written.

---

## ADR-0006 — Gate result: Foundry serves no Qwen vision model serverlessly; ADR-0002 Option A invalidated as specified

- **Timestamp:** 2026-09-02T13:05:00Z
- **Clause/Contract Affected:** Supersedes and invalidates **ADR-0002** as written.
  ADR-0002 was accepted conditionally on a verification gate; the gate has been run
  and it failed. Per §1.2 and §3.3 the prior entry is neither edited nor
  reinterpreted.
- **Marker status:** Planning Only
- **Status:** Gate result **Accepted**. Replacement selection **Proposed — awaiting
  operator authorization** (§8.2: new billable infrastructure and/or a new vendor).

### What was verified, and how

Read-only queries against subscription `861d741b-…` on 2026-09-02:

| Check | Command | Result |
|---|---|---|
| Qwen models, 4 regions | `az cognitiveservices model list -l <region>` | `qwen3-32b` only, in `centralus` (DataZoneStandard) and `eastus`/`eastus2`/`westus3` (GlobalStandard) |
| All Alibaba-format models, centralus | same, filtered `model.format=='Alibaba'` | `qwen3-32b` only — 2 rows of 304 total |
| Any vision/VL-named model, centralus | same, filtered on `vl`/`VL`/`vision` | zero rows |
| `qwen3-32b` capability | Microsoft Learn, *Foundry Models sold by Azure* (updated 2026-08-27) | listed **"Text to text"** |
| GPU quota, centralus | `az vm list-usage`, `az rest` | **Not determined** — see F-0005 |

### Finding

`qwen3-32b` — the only Qwen model available serverlessly in this subscription — is
**text-only**. It cannot caption an image. The Qwen3-VL vision family is present in
the Foundry catalogue, but as a community/Hugging Face model deployed to **managed
compute**: a customer-dedicated GPU VM billed per core-hour, not pay-per-call.

This is decisive because it collapses the distinction ADR-0002 was built on.
Option A was selected over Option C on the explicit grounds that a GPU container is
"the single largest cost and operations line item in this plan, incurred before one
caption is proven useful." Reaching Qwen3-VL through Foundry **is that GPU cost**,
wearing Foundry's clothes. The managed-identity and in-tenant advantages survive;
the economic argument that ranked A above C does not.

### Replacement options

**Option A′ — Foundry managed compute, Qwen3-VL 2B/4B/8B** *(available, expensive)*
- *Architectural Mechanics:* Dedicated GPU online endpoint in the existing subscription.
- *Advantages & Alignment:* Delivers Qwen specifically, as originally requested. Keeps
  photos in-tenant with managed identity. No second vendor.
- *Disadvantages & Operational Risk:* A standing per-core-hour bill. Managed online
  endpoints do not scale to zero, so cost accrues whether or not anyone uploads a
  photo — for a single-writer SOP application whose upload volume is intermittent.
  GPU quota in `centralus` is unconfirmed (F-0005) and may require a quota request or
  a region change away from where `howtodoit-api` runs.

**Option B′ — Alibaba DashScope** *(real Qwen, real serverless)*
- *Architectural Mechanics:* HTTPS to `dashscope.aliyuncs.com`; key in Key Vault.
- *Advantages & Alignment:* The only route that delivers **Qwen vision at
  pay-per-call pricing**. Newest Qwen-VL models. No new Azure resource, no GPU quota.
- *Disadvantages & Operational Risk:* Second cloud vendor and a long-lived secret,
  which forfeits the structural "no key exists to leak" guarantee that made §4.3's
  secrets assertion cheap. Sends user photographs across a jurisdictional border — an
  App Store disclosure obligation, not merely an integration detail.

**Option C′ — Foundry serverless, non-Qwen vision model** `[RECOMMENDED]`
- *Architectural Mechanics:* Unchanged from ADR-0002 Option A in every respect except
  the model identifier. `centralus` already serves vision-capable models
  pay-per-call today (confirmed present: `gpt-4.1-mini`, `gpt-5-mini`, `gpt-4o-mini`
  among 132 OpenAI-format entries).
- *Advantages & Alignment:* Preserves **every** property that made Option A
  attractive — no key to leak, photos never leave the tenant, one Bicep change, one
  vendor, one bill, pay-per-call — and adds no GPU cost, no quota risk, and no region
  move. Captioning a photo in two sentences and ordering a handful of images is not a
  frontier task; a small model is sufficient.
- *Disadvantages & Operational Risk:* **Does not use Qwen**, which the operator asked
  for by name. Substitutes a proprietary hosted model for an open-weight one, which
  forecloses self-hosting later without another migration.

### Selection

**Option C′ [RECOMMENDED]**, on the grounds that it changes only the model
identifier while preserving every architectural property that justified the original
choice, at the lowest cost and risk. **This selection is proposed, not committed** —
it substitutes a different model family than the operator requested, so it requires
explicit authorization before any implementation code (§8.2).

The `IImageAnalysisService` abstraction in ADR-0004 is what keeps this reversible:
the model provider sits behind one interface, so if Qwen-VL later reaches Foundry
serverless, swapping to it is an implementation change under a new ADR, not a
re-architecture.

### Trade-Off & Consequence

- **Gained:** A verified-available path to captioning with no standing GPU cost.
- **Surrendered:** Qwen specifically, under the recommended option.
- **Admitted debt/risk:** The plan no longer delivers the model the operator named.
  If Qwen is a hard requirement rather than a proxy for "a capable vision model,"
  Option B′ is the only route that satisfies it at sane cost, and its cross-border
  photo egress must then be accepted deliberately and disclosed at App Store review.

---

## ADR-0007 — Ordering strategy after measurement: proposed options, operator decision required

- **Timestamp:** 2026-09-02T14:30:00Z
- **Clause/Contract Affected:** Amends **ADR-0004** (does not invalidate its Option B
  selection, which measurement confirmed). Engages §8.1 (Strict Scope Fidelity —
  the agent may not silently shrink scope).
- **Marker status:** Planning Only
- **Status:** **Proposed — operator decision required.** No option selected.

### Problem

F-0006 measured the ADR-0004 pipeline against the repo's own ground truth.
Captioning is production-quality (44/44, 100% sentence compliance, qualitatively
accurate). Ordering peaks at Kendall tau ≈ 0.56–0.59 — roughly 78% of image pairs
correct, with the whole sequence exactly right in 1–2 of 9 cases.

Escalating the model does not help (`gpt-4.1` 0.59 vs `gpt-4.1-mini` 0.56, at five
times the cost). Ordering from pixels instead of captions is worse (0.30).
Prompting for state cues is worse (0.41). The approach is at its ceiling.

Half the requested feature works and half does not. §8.1 forbids quietly dropping
the half that does not, so the options are recorded here for selection rather than
decided.

### Options Analyzed

**Option A — Ship auto-ordering as an automatic action anyway** *(not recommended)*
- *Architectural Mechanics:* As ADR-0003/0004 describe; analyze writes `SortOrder`.
- *Advantages & Alignment:* Delivers the literal request. No further work.
- *Disadvantages & Operational Risk:* At ~1 pair in 5 misordered, a writer must
  inspect and repair nearly every sequence. A wrong order that looks authoritative
  is worse than no order, because it costs more attention than starting from upload
  order. This is precisely the failure F-0001's residual-risk statement predicted.

**Option B — Ship ordering as a clearly-labelled suggestion** *(viable)*
- *Architectural Mechanics:* Analyze proposes an order; the UI presents it as an
  unapplied suggestion ("Suggested order — apply?") the writer accepts or dismisses.
  `SortOrder` is not written until accepted.
- *Advantages & Alignment:* Honest about confidence. Costs almost nothing beyond what
  is already built. Occasionally right on the whole sequence (11–22%) and usually a
  better starting point than nothing.
- *Disadvantages & Operational Risk:* Adds UI and a decision the writer must make on
  every upload, for a suggestion that is usually wrong somewhere. Value is genuinely
  unclear, and it may read as the product being unsure of itself.

**Option C — Order deterministically from capture time; model ordering as fallback** `[RECOMMENDED]`
- *Architectural Mechanics:* Read `DateTimeOriginal` from the file's EXIF **before**
  `compressImage` re-encodes it (falling back to `File.lastModified`, which
  `ImageUploader` already reads today for its element keys), send it as an upload
  field, and store it. Order by capture time. Invoke model ordering only when
  timestamps are missing, identical, or the photos were picked from a library out of
  capture order.
- *Advantages & Alignment:* Ordering becomes **deterministic and correct** rather
  than 78% correct, for photos actually taken in sequence — which is the primary
  capture path this product is built around. It costs nothing per upload, cannot
  hallucinate, and is trivially testable. It also closes F-0001's residual risk
  properly instead of mitigating around it, and it applies to **both** clients, not
  only mobile.
- *Disadvantages & Operational Risk:* Requires a client change on web and mobile, an
  upload contract addition (§8.2), and one nullable column on `StepImage` (a second
  §2.3 schema refinement, needing its own ADR). Useless for photos genuinely picked
  out of order from a library — the model fallback covers that case, at its measured
  accuracy. Depends on device clocks being sane.

**Option D — Continue iterating on prompts and models** *(not recommended now)*
- *Architectural Mechanics:* More prompt variants, larger models, few-shot examples.
- *Advantages & Alignment:* Might close some of the gap.
- *Disadvantages & Operational Risk:* Four configurations across two models have
  already been measured, and the spread (0.30–0.59) shows no configuration
  approaching usable. Model escalation is measured as ineffective. Further iteration
  is speculative where Option C is deterministic.

### Recommendation

**Option C**, with **Option B's suggestion UI as the fallback path** for photos whose
capture times are unavailable or unhelpful. Captioning proceeds unchanged in every
option — it is measured as ready and is not blocked by this decision.

### Trade-Off & Consequence

- **Gained:** Ordering that is correct by construction on the primary capture path,
  instead of probabilistic everywhere.
- **Surrendered:** Ordering is no longer purely server-side; it acquires a dependency
  on client-supplied metadata and on device clocks.
- **Admitted debt/risk:** Client-supplied timestamps are untrusted input and must be
  validated (implausible dates, clock skew, all-identical values). A second schema
  refinement and an upload contract change both require operator authorization before
  any code. Until this is decided, **Part 1 proceeds with captioning only**, and the
  ordering tasks stay open rather than being quietly dropped (§8.1).

---

## ADR-0008 — Captioning model selected: gpt-4.1-mini

- **Timestamp:** 2026-09-02T15:30:00Z
- **Clause/Contract Affected:** Confirms and closes **ADR-0006 Option C′**, which was
  recorded as *proposed* pending operator authorization. Satisfies §10.1 (Ingestion
  Registration) via `docs/PROVENANCE.md`.
- **Marker status:** Requires Marker — the analysis service implementation
- **Status:** **Accepted.** Operator-authorized 2026-09-02.

### Selection

`gpt-4.1-mini`, version `2025-04-14`, `GlobalStandard` (pay-per-call), deployed to
`cog-howtodoit-dev` in `centralus`.

### Why this model

The choice rests on measurement, not on reputation or list price. Against 44 of the
project's own seed images — shuffled, relabelled, and scored on the ground truth in
`DbSeeder.cs` — `gpt-4.1-mini` returned 44 of 44 captions with zero errors, 100%
compliance with the 1–2 sentence rule, none exceeding ADR-0001's 500-character limit,
and a mean length of 156 characters. More importantly the captions *discriminate*:
for the espresso sequence it distinguished grinding into the portafilter from
weighing it on a scale from tamping from flushing the group head from extracting into
the cup. Telling one step of a procedure apart from a superficially similar one is
the entire job, and it did that.

The cheaper candidate did not. `Phi-4-multimodal-instruct` averaged 55-character
captions, emitted one degenerate single-token response, and produced text too generic
to separate adjacent steps — "A person is operating a coffee machine" where
`gpt-4.1-mini` gave "rinsing the portafilter under the espresso machine's water
spout." That is not a saving; it is a failure at the one task being bought. Escalating
the other way was equally unrewarding: `gpt-4.1`, at roughly five times the price,
returned no meaningful gain. `gpt-4.1-mini` therefore sits at the point where quality
is sufficient and further spending buys nothing, and at this application's volume the
absolute cost is negligible either way — the entire nine-configuration evaluation
across three models cost about seven cents.

### Qwen was the preferred model and could not be used

This should be recorded plainly, because the original request named Qwen and this
decision does not deliver it. Qwen was the right instinct: open weights would have
meant portability, the option to self-host later, and freedom from a single vendor's
pricing and deprecation schedule. Nothing in the evaluation contradicted that
preference — Qwen vision models were never tested, because they were never reachable.

The blocker was availability, not merit. Azure AI Foundry serves exactly one Alibaba
model pay-per-call in this subscription, `qwen3-32b`, which Microsoft documents as
"Text to text" and which cannot accept an image at all. The Qwen3-VL vision family is
present in the catalogue only as managed compute — a dedicated GPU virtual machine
billed per core-hour that does not scale to zero. For an application whose uploads are
intermittent and single-writer, that converts a cost of pennies per month into
hundreds of dollars per month of standing charge, paid whether or not anyone uploads a
photo. The remaining route to genuine Qwen, Alibaba's DashScope API, would have meant
a second cloud vendor, a long-lived API key in place of managed identity, and user
photographs crossing a jurisdictional border. Each of those was judged too high a
price for a model-brand preference. Full evidence is in ADR-0006 and F-0003.

### Trade-Off & Consequence

- **Gained:** Measured caption quality; managed identity with no stored key; photos
  never leaving the Azure tenant; one vendor, one bill; no GPU and no quota risk.
- **Surrendered:** Open weights, and with them the option to self-host or migrate the
  model without an integration change. A proprietary model now sits on the critical
  path of a core feature.
- **Admitted debt/risk:** Vendor dependency for captioning, subject to third-party
  pricing and deprecation. This is bounded by ADR-0004's `IImageAnalysisService`
  abstraction: the provider sits behind one interface, so if a Qwen vision model later
  reaches Foundry pay-per-call, switching is an implementation change under a new ADR
  rather than a re-architecture. Revisiting this is explicitly anticipated, not
  foreclosed.

---

## ADR-0009 — Amends ADR-0004: bounded concurrency and retry policy

- **Timestamp:** 2026-09-02T15:30:00Z
- **Clause/Contract Affected:** Amends **ADR-0004** (does not invalidate it).
  Closes the design half of **F-0007**.
- **Marker status:** Requires Marker — the analysis service implementation
- **Status:** Accepted, not yet implemented

### Problem

ADR-0004 specifies parallel per-image caption calls but is silent on concurrency,
quota, and retry. Implemented literally, the first evaluation run returned
`HTTP 429 rate_limit_exceeded` on 34 of 44 caption calls against a deployment at its
default 10K TPM. Unbounded fan-out against a token-per-minute-limited endpoint fails
closed. This is a specification gap in ADR-0004, found by measurement before any
production code was written.

### Unequivocal Winner Bypass (§3.5)

No options matrix is presented. The requirement is dictated by an existing external
constraint — the deployment's TPM allowance — and the remedy (a concurrency bound plus
backoff honouring `Retry-After`) is the single standard response to it. §3.5 permits
waiving the multiple-option requirement where one approach is mandated by existing
performance constraints; this clause is cited explicitly as required.

### Amendment

1. Caption fan-out runs under a **bounded concurrency limit**, configurable, defaulting
   low. Verified at 3 against a 150K TPM deployment with zero failures and zero retries.
2. Retries use **exponential backoff honouring the `Retry-After` header**, on `429` and
   `5xx` only, with a capped attempt count. Non-retryable statuses fail fast.
3. The concurrency bound, the analyze endpoint's image cap (ADR-0004, proposed 20), and
   the deployment's TPM allocation are **chosen together and documented together**.
   None is safe to set in isolation: the cap bounds worst-case latency once backoff
   converts a quota breach into waiting rather than failing.

### Trade-Off & Consequence

- **Gained:** The analyze endpoint survives realistic batch uploads instead of failing
  on the first multi-photo step.
- **Surrendered:** Some of the wall-clock advantage ADR-0004 claimed for parallel
  fan-out; throughput is now capped by the concurrency bound rather than by the model.
- **Admitted debt/risk:** Backoff turns a quota breach into latency, so an
  under-provisioned deployment produces a slow upload rather than a visible error —
  a failure mode that hides. The service must therefore log retry counts, and the
  closing test asserts both the concurrency ceiling and retry-on-429 behaviour.

---

## ADR-0010 — Ordering strategy selected: capture-time first, labelled suggestion as fallback

- **Timestamp:** 2026-09-02T16:05:00Z
- **Clause/Contract Affected:** Closes **ADR-0007**, which recorded four options and
  deliberately selected none pending operator decision. Amends **ADR-0004**: model
  ordering is demoted from the primary mechanism to a fallback.
- **Marker status:** Requires Marker — the ordering path in the analysis service
- **Status:** **Accepted.** Operator-authorized 2026-09-02.

### Selection

**ADR-0007 Option C, with Option B as the fallback path.**

1. **Primary — deterministic.** Capture time is read client-side *before*
   `compressImage` re-encodes and destroys it, transmitted with the upload, stored,
   and used to order the images. No model involvement.
2. **Fallback — labelled suggestion.** Where capture times are absent, identical, or
   otherwise unusable, the model proposes an order which is presented as an unapplied
   suggestion the writer accepts or dismisses. `SortOrder` is not written until
   accepted.

### Governing premise, recorded because the design depends on it

The operator's justification, which is the load-bearing assumption here: **people
photograph a procedure as they perform it.** Someone documenting an SOP works through
the task and captures each step as it happens; they do not perform the whole job, then
assemble a pile of photos and deliberately stage them out of sequence. Expecting
otherwise would be a strange model of how people actually operate.

This matters because it determines which mechanism is primary. If photos arrive in
capture order the overwhelming majority of the time, then a deterministic timestamp
sort is correct almost always and costs nothing, while a language model guessing from
captions is correct about 78% of the time per pair and costs money on every upload.
The measurement in F-0006 established that the model cannot do this job well; this
premise establishes that it usually does not need to.

**This premise is falsifiable and should be revisited if it fails.** If real usage
shows writers routinely uploading from a library out of capture order — bulk imports,
photos gathered from several people, or documentation assembled after the fact — the
fallback stops being an edge case and becomes the main path, and this decision needs a
superseding entry rather than quiet reinterpretation (§1.2).

### Trade-Off & Consequence

- **Gained:** Ordering becomes correct by construction on the primary capture path,
  rather than ~78% correct everywhere. No per-upload model cost for ordering. Trivially
  testable. Properly closes F-0001's residual risk instead of mitigating around it.
  Applies to both clients, not only mobile.
- **Surrendered:** Ordering is no longer purely server-side. It acquires a dependency
  on client-supplied metadata and on device clocks being sane.
- **Admitted debt/risk:** Client-supplied timestamps are **untrusted input** and must be
  validated — implausible dates, clock skew, timezone handling, and the all-identical
  case where a batch copy has flattened every timestamp. A client that silently sends
  nothing degrades to the fallback, so absence must be detectable rather than assumed.

---

## ADR-0011 — Add capture-time fields to StepImage

- **Timestamp:** 2026-09-02T16:05:00Z
- **Clause/Contract Affected:** §2.2 (Immutable Baseline), §2.3 (Justified Schema
  Refinement) — entity `HowToDoItApp.Models.StepImage`. Also §8.2 (public API contract
  — the upload endpoint gains optional fields).
- **Marker status:** Requires Marker — `HowToDoItApp/Models/StepImage.cs` and the EF
  migration
- **Status:** Accepted in principle by ADR-0010; **the specific column shape below is
  the agent's design decision and is open to operator override.**

### Problem

ADR-0010 requires capture time to reach the server and persist. The scaffold has no
field for it. This is the second §2.3 refinement of this entity and is recorded
separately from ADR-0001 so that a code marker can cite the specific decision.

### Options Analyzed

**Option A — Single `CapturedAt` column** *(rejected)*
- *Architectural Mechanics:* One nullable `datetime2`.
- *Advantages & Alignment:* Smallest possible change. One column, one migration.
- *Disadvantages & Operational Risk:* Cannot distinguish a trustworthy EXIF
  `DateTimeOriginal` from a `File.lastModified` value, which may be a download, copy,
  or sync time rather than a capture time. Those two have materially different
  reliability, and collapsing them means the server cannot tell a real capture
  sequence from filesystem noise — so it cannot decide when to fall back to the
  suggestion path, which is the mechanism ADR-0010 depends on.

**Option B — `CapturedAt` + `CapturedAtSource`** `[RECOMMENDED]`
- *Architectural Mechanics:* Nullable `datetime2` plus a short nullable discriminator
  recording provenance (`exif` | `filetime`). Null source means no timestamp was
  supplied.
- *Advantages & Alignment:* Makes confidence explicit and queryable. The service can
  order confidently on `exif`, treat `filetime` as weak evidence, and fall back to the
  labelled suggestion when neither is usable. Mirrors the pattern ADR-0001 already
  established with `IsCaptionAiGenerated`, where a provenance flag is what makes a
  negative assertion expressible: here, that a `filetime` value never silently
  masquerades as a verified capture time.
- *Disadvantages & Operational Risk:* Two columns rather than one; a third widening of
  an authoritative entity across this work.

**Option C — JSON metadata column** *(rejected)*
- *Architectural Mechanics:* One `nvarchar(max)` holding arbitrary upload metadata.
- *Advantages & Alignment:* Future metadata needs cost no further migrations.
- *Disadvantages & Operational Risk:* Unsortable and unindexable without computed
  columns, and ordering is precisely a sort. Trades a typed contract for a schemaless
  bag on an authoritative entity — the "tidy up in passing" shape §2.2 exists to
  prevent, arrived at from the opposite direction.

### Selection

**Option B.**

### Trade-Off & Consequence

- **Gained:** Deterministic ordering with explicit, queryable confidence; a clean
  boundary at which to fall back to the suggestion path.
- **Surrendered:** Two more columns of permanent surface on `StepImage`.
- **Admitted debt/risk:** The upload endpoint gains two optional form fields, which is
  a public contract change (§8.2). Both are client-supplied and untrusted; validation
  rules and their table-driven tests must land in the same change as the columns, not
  after. Timezone semantics must be fixed explicitly at the contract — storing an
  ambiguous local time would produce ordering that is wrong only sometimes, which is
  the worst failure mode available here.

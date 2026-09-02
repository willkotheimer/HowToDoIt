# Findings Register

Durable log of defects, edge cases, security flaws, performance regressions, and
provenance debt. Governed by the System Governance Specification §5.

**Schema (§5.2):** every entry records a unique ID and timestamp, root cause and
severity, resolution classification (Fixed / Mitigated), a residual risk statement
("none" is forbidden unless formally proven), and the closing test reference — the
exact test file and signature that holds the failure mode shut.

**Schema note:** §5.2's resolution vocabulary assumes a resolved finding. Findings
below that are logged at discovery and not yet resolved carry
`Resolution: Pending` with the plan task that will close them. This is an explicit
extension of the schema, recorded here rather than applied silently.

---

## F-0001 — EXIF capture time is destroyed client-side before upload

- **Timestamp:** 2026-09-02T12:37:08Z
- **Severity:** Medium — constrains architecture, no data loss
- **Root cause:** `HowToDoIt.ui/src/Helpers/compressImage.ts` decodes each photo
  with `createImageBitmap`, draws it to an HTML canvas, and re-encodes via
  `canvas.toBlob`. Canvas re-encoding emits no EXIF segment, so `DateTimeOriginal`
  and every other metadata field are absent from the JPEG that reaches
  `POST /api/StepImages/upload`. The rotation fix (`imageOrientation: 'from-image'`)
  is deliberate and correct; the metadata loss is an unremarked side effect of it.
- **Impact on this work:** Deterministic chronological ordering of uploaded photos
  is not implementable server-side. This is the reason ADR-0004 Option C is
  classified non-viable rather than merely unattractive.
- **Superseded resolution (2026-09-02T12:37:08Z):** Mitigated — ordering routed
  through model inference (ADR-0004 Option B) instead of capture metadata. The
  residual-risk statement recorded at that time predicted that if ordering accuracy
  proved poor, the follow-up would be to capture `DateTimeOriginal` client-side before
  compression and transmit it as an upload field. **F-0006 measured exactly that poor
  accuracy, and that follow-up is now the selected design.**
- **Resolution (2026-09-02T16:05:00Z):** **Fixed by design, pending implementation.**
  ADR-0010 makes capture time the primary ordering mechanism and demotes model
  ordering to a labelled fallback; ADR-0011 adds `CapturedAt` and `CapturedAtSource`
  to `StepImage`. The metadata loss described above is no longer worked around — it is
  prevented, by reading the timestamp before `compressImage` destroys it.
- **Residual risk:** Capture time now arrives as **untrusted client input**. Device
  clocks may be wrong or skewed; a batch copy can flatten every `File.lastModified` to
  an identical value; timezone handling must be pinned at the contract or ordering
  will be wrong only intermittently, which is the hardest variant to notice. A client
  that sends nothing must degrade to the fallback detectably rather than silently.
  Photos genuinely picked from a library out of capture order remain outside what this
  fixes, and fall to the model suggestion at its measured accuracy.
- **Closing test reference:** Pending — `HowToDoIt.ui/src/Helpers/Tests/compressImage.test.ts`,
  `describe('compressImage') > it('strips EXIF metadata from the re-encoded file')`.
  A regression test that pins the *known* behaviour so a future contributor cannot
  assume EXIF survives. Closes in Task 1.1.

---

## F-0002 — `UpdateImageOrder` accepts image ids from any step and silently drops unknown ids

- **Timestamp:** 2026-09-02T12:37:08Z
- **Severity:** Low today; **rises to Medium** once the analyze endpoint drives this
  path with model-generated ids
- **Root cause:** `HowToDoItApp/DataAccess/StepImageRepository.cs`,
  `UpdateImageOrder(int[] orderedImageIds)` assigns `SortOrder = i` by looking each
  id up individually. It never verifies that the ids belong to a single
  `WorkStepId`, never verifies the set is complete for that step, and skips ids
  that resolve to nothing. Consequences:
  - Ids belonging to a *different* step are reordered without objection.
  - An id list that omits some of the step's images leaves those images on stale
    `SortOrder` values that can now collide or interleave with the rewritten ones.
  - A hallucinated id in a model-proposed order is silently ignored, producing a
    partial reorder that reports success.
- **Why it matters now:** Reached today only by an authenticated allow-listed
  writer through deliberate UI actions, which is why it has been harmless. ADR-0003
  introduces a programmatic caller whose id list originates from a language model,
  so malformed input reaching this method stops being hypothetical.
- **Resolution:** Pending — closes in Task 1.4 (validate the id set is exactly the
  set of images for one step; reject otherwise).
- **Residual risk (projected after fix):** Validation is enforced in the repository,
  not the database. A future caller writing `SortOrder` through a different code
  path bypasses it. Not closed by a schema constraint because SQL cannot express
  "this set is complete" without a trigger.
- **Closing test reference:** Pending —
  `HowToDoItApp.Tests/DataAccess/StepImageRepositoryTests.cs`,
  `UpdateImageOrder_RejectsIdSetThatIsNotExactlyOneStepsImages(...)` (table-driven
  per §6.2: cross-step ids, unknown id, missing id, duplicate id, empty set).

---

## F-0003 — Owed Provenance Debt: Qwen model licensing and availability unverified

- **Timestamp:** 2026-09-02T12:37:08Z
- **Severity:** High — blocks production publish per §10.2
- **Root cause:** ADR-0002 selects Azure AI Foundry as the Qwen host, but no
  verification has been performed of (a) whether a Qwen vision model is in the
  Foundry catalogue for this subscription, (b) the exact model and deployment name,
  (c) region and quota availability, or (d) the licence attached to the model
  weights and its terms for commercial use. Qwen model licensing is not uniform —
  open-weight releases and hosted-API-only variants carry different terms. Nothing
  in this plan should be read as asserting any of these facts.
- **Gate result (2026-09-02T13:05:00Z):** Task 1.0 has been **run, and it failed.**
  The only Qwen model available serverlessly in this subscription is `qwen3-32b`,
  which Microsoft documents as **"Text to text"** — it cannot caption an image. No
  vision-capable Alibaba model exists in the `centralus`, `eastus`, `eastus2` or
  `westus3` catalogues. Qwen3-VL is reachable on Foundry only via managed compute
  (a dedicated per-core-hour GPU VM). Full evidence and the superseding decision are
  recorded in **ADR-0006**.
- **Resolution:** **Fixed (2026-09-02T15:30:00Z).** The unverified assumption was
  replaced by a measured result; ADR-0002 was invalidated by ADR-0006 rather than
  reinterpreted; a replacement was evaluated against real data and authorized by the
  operator in **ADR-0008** (`gpt-4.1-mini`, version `2025-04-14`); and the §10.1
  ingestion entry is now recorded in `docs/PROVENANCE.md` with a pinned version,
  origin, and licence classification. The §10.2 publish block is lifted.
- **Residual risk:** The selected model is a **proprietary hosted entitlement, not
  redistributable weights** — there is no artifact to vendor or self-host, so
  continuity depends on the provider's pricing and deprecation schedule rather than
  on anything in this repository. The deployment pins an explicit model version so a
  provider-side refresh cannot silently change behaviour, and ADR-0004's
  `IImageAnalysisService` abstraction bounds the cost of switching. This risk is
  accepted, not eliminated; "none" would be false here.
- **Closing test reference:** Not a code-level failure mode; closed by a recorded
  verification result (model id, version, region, licence, source URL) appended to
  the §10.1 registry in this repository and confirmed by the operator. The
  accompanying code-level assertion is the live-dependency contract test in Task 1.3
  (§7.1), `HowToDoItApp.Tests/Integration/ImageAnalysisLiveContractTests.cs`.

---

## F-0004 — `StepImageRepository.Add` cannot place an image at SortOrder 0

- **Timestamp:** 2026-09-02T12:37:08Z
- **Severity:** Low — latent; no current caller triggers it
- **Root cause:** `HowToDoItApp/DataAccess/StepImageRepository.cs`, `Add` uses
  `if (image.SortOrder == 0)` as its test for "caller did not specify a position."
  Because `0` is both the default value of `int` and a legitimate first position,
  a caller that explicitly requests position 0 is overridden and appended to the end
  instead. The sentinel is indistinguishable from the value.
- **Why it is logged now:** No caller passes an explicit `SortOrder` today, so the
  defect is unreachable. It is recorded because Part 1 adds ordering logic around
  this entity and a future caller could reasonably expect explicit positioning to
  work. §5.1 forbids leaving it as a chat-only observation.
- **Resolution:** Pending — deliberately **not** scheduled for Part 1. Fixing it
  requires changing `SortOrder` to a nullable parameter or adding an explicit
  overload, which touches the authoritative entity's write path for no benefit to
  the requested scope (§8.1: no scope expansion into adjacent problems).
- **Residual risk:** Any future code that sets `SortOrder = 0` explicitly and relies
  on it will silently get the wrong position. Mitigated only by this register entry
  until a caller needs the behaviour.
- **Closing test reference:** None yet — the finding is open by decision, not by
  oversight. A closing test would be
  `StepImageRepositoryTests.Add_HonoursExplicitSortOrderZero(...)`.

---

## Protocol Disclosures (§6.3)

None to date. No implementation code has been authored for this work; the ADR
entries in `docs/decisions/ADR.md` were written before any code, as §3.1 and §3.4
require. Any future instance of implementation preceding its test, or of a test
assertion altered to force a pass, is appended here before work continues.

---

## F-0005 — Local Azure CLI cannot query quota or ML registries; GPU availability undetermined

- **Timestamp:** 2026-09-02T13:05:00Z
- **Severity:** Medium — blocks completion of the ADR-0006 Option A′ assessment
- **Root cause:** Azure CLI 2.67.0 on this machine raises
  `cannot import name 'get_arm_endpoints' from 'azure.mgmt.core.tools'` for `az rest`
  and for every `az ml` extension command. Separately, `az vm list-usage` returns an
  empty result set for `centralus` **and** for `eastus2` — an empty response in two
  independent regions indicates a broken command, not a genuine quota of zero, so no
  quota conclusion may be drawn from it. The `ml` extension installs successfully but
  every command under it fails on the same import error.
- **What is therefore NOT known:** whether this subscription has any GPU quota in
  `centralus` (where `howtodoit-api` runs), and what the Hugging Face registry lists
  for Qwen3-VL. ADR-0006 Option A′ cannot be fully costed until this is answered.
- **What IS known and unaffected:** `az cognitiveservices model list` executed
  successfully and returned real data for four regions. Every catalogue claim in
  ADR-0006 rests on that command, not on the broken ones.
- **Resolution:** Pending — closes by upgrading the Azure CLI and re-running, or by
  reading quota from the Azure portal.
- **Residual risk:** If Option A′ is chosen without this check, the deployment may
  fail at apply time on a quota denial, or force a region move away from where the
  API and its storage currently run.
- **Closing test reference:** Not a code-level failure mode. Closed by a recorded
  quota figure for the target region, appended to the §10.1 registry.

---

## F-0006 — Measured: captioning is production-quality; auto-ordering is not

- **Timestamp:** 2026-09-02T14:30:00Z
- **Severity:** High — invalidates half of the requested feature as specified
- **How measured:** 44 seed images across 9 sequences, each shuffled and relabelled
  `a,b,c…` so order cannot be read off the filename, scored against the ground truth
  in `DbSeeder.cs`. Metric is Kendall tau (1.0 = perfect, 0.0 = random) plus
  exact-order rate. Harness: `run_eval.mjs`, `reorder_experiment.mjs`,
  `order_from_images.mjs`. Model: `gpt-4.1-mini` unless stated.

### Captioning — works

| Metric | Result |
|---|---|
| Captions returned | 44 / 44, zero errors |
| 1–2 sentence compliance | **100%** |
| Over ADR-0001's 500-char limit | **0** |
| Mean caption length | 156 chars |

Qualitatively accurate on inspection. For sequence 103 the model produced
"grinding coffee beans … collecting the ground coffee in a portafilter", "holding a
portafilter … on a digital scale", "pressing ground coffee into a portafilter using
a tamper", "rinsing the portafilter under the espresso machine's water spout",
"extracting coffee into a white cup" — a correct, ordered account of the espresso
workflow.

### Ordering — does not work

| Configuration | Kendall tau | Exact order |
|---|---|---|
| ADR-0004 Option B, terse prompt (as designed) | 0.30 | 11% |
| Option B, dependency-reasoning prompt | **0.56** | **22%** |
| Option B, reasoned prompt | 0.38 | 22% |
| Option B, dependency prompt, on `gpt-4.1` (5× cost) | 0.59 | 11% |
| **Option A** — order direct from images (ADR-0004's rejected option) | 0.30 | 11% |
| Option B′ — state-aware caption prompt | 0.41 | 11% |

**Best achievable was tau ≈ 0.56–0.59**, i.e. about 78% of image *pairs* ordered
correctly, ~22% wrong. Exact whole-sequence order was right in 1–2 of 9 cases.

### What the numbers rule out

- **Not a model-capability problem.** `gpt-4.1` scored 0.59 against `gpt-4.1-mini`'s
  0.56 — five times the cost for no meaningful gain. Escalating the model does not
  fix this.
- **Not a caption-quality problem.** The captions for sequence 103 contain every cue
  a human needs to order them correctly, yet that sequence still scored 20% position
  accuracy under Option B.
- **Not a wrong-option problem.** ADR-0004's selection of Option B over Option A is
  **vindicated by measurement**: ordering from caption text (0.56) beat ordering
  directly from pixels (0.30). The original decision holds.
- **Not fixable by asking for state cues.** Explicitly prompting for progress state
  (empty/full, loose/tamped) scored *worse* (0.41) than plain captions.

### Consequence

The requested feature splits cleanly. **Captioning is ready to build.**
**Auto-ordering, as an automatic action, is not** — at ~1 pair in 5 misordered, a
writer would have to check and correct nearly every sequence, which is worse than no
suggestion at all for a five-step SOP.

This materially elevates **F-0001**. EXIF capture time would order photos
*deterministically and correctly*, and the only reason it is unavailable is the
client-side canvas re-encode. What was filed as an architectural constraint is now
the most promising route to the ordering half of the feature.

- **Resolution:** **Mitigated (2026-09-02T16:05:00Z).** The operator selected
  ADR-0007 Option C with Option B as fallback, recorded in **ADR-0010**. Model
  ordering is not fixed — its measured ceiling stands — but it is demoted off the
  primary path, so the ceiling no longer determines the feature's quality. Ordering
  now comes from capture time, which is deterministic.
- **Residual risk:** The model's ~78% pairwise accuracy still governs the fallback
  path, which is what runs whenever capture times are missing, identical or unusable.
  Users on that path see confidently-wrong orders — mitigated only by presenting them
  as unapplied suggestions requiring acceptance, never written silently. The fallback's
  frequency is unknown until real usage is observed; if it turns out to be common, the
  premise underpinning ADR-0010 has failed and that decision needs superseding.
- **Closing test reference:** The harness itself is the closing artifact; it becomes
  `HowToDoItApp.Tests/Integration/ImageAnalysisLiveContractTests.cs` per Task 1.3,
  with tau over the seed set asserted above an agreed floor.

---

## F-0007 — Parallel caption fan-out exceeds deployment TPM and fails closed

- **Timestamp:** 2026-09-02T14:30:00Z
- **Severity:** Medium — would have shipped as an outage
- **Root cause:** ADR-0004 Option B fans out N caption calls concurrently. Against a
  `GlobalStandard` deployment at its default 10K TPM, the first evaluation run
  returned **HTTP 429 `rate_limit_exceeded` on 34 of 44 caption calls** — 39 failures
  in total. Each 768px image costs roughly 800 image tokens, so even five concurrent
  captions exceed a small deployment's per-minute allowance.
- **Why it matters:** The ADR-0004 entry describes unbounded parallel fan-out and says
  nothing about concurrency limits, retry, or quota. Implemented literally as written,
  the analyze endpoint would fail in production the first time a writer uploaded a
  handful of photos at once.
- **Note on the first run's scores:** that run reported tau −0.54 and 16% position
  accuracy. Those numbers measure **failed HTTP calls, not model quality**, and are
  recorded here only so they are not mistaken for a result. Every figure in F-0006
  comes from clean runs with zero failures.
- **Resolution:** Fixed in the harness — bounded concurrency (`pMap`) plus
  exponential backoff honouring `Retry-After`. Re-run: 0 failures, 0 retries.
  **Design half closed 2026-09-02T15:30:00Z by ADR-0009**, which amends ADR-0004 with
  the concurrency bound, the retry policy, and the requirement that the bound, the
  image cap and the TPM allocation be chosen together. The **implementation half
  remains Pending** until Task 1.3 is built and its closing test passes.
- **Residual risk:** Backoff converts a quota breach into latency rather than an
  error, so a large upload batch on a small deployment will be slow rather than
  broken. The analyze endpoint's image cap (ADR-0004, proposed 20) is what bounds
  that latency, and the cap and the TPM allocation must be chosen together —
  neither is safe to set alone.
- **Closing test reference:** Pending —
  `HowToDoItApp.Tests/Services/ImageAnalysisConcurrencyTests.cs`,
  `DescribeBatch_RespectsConcurrencyLimit_AndRetriesOn429(...)`, asserting the
  service issues no more than N concurrent requests and retries a simulated 429.

### F-0006 addendum — model comparison completed (2026-09-02T15:10:00Z)

`Phi-4-multimodal-instruct` was evaluated on the identical 44-image set.

| Metric | `gpt-4.1-mini` | `Phi-4-multimodal-instruct` |
|---|---|---|
| Captions returned | 44 / 44 | 42 / 44 (2 errors) |
| Mean caption length | 156 chars | **55 chars** |
| 1–2 sentence compliance | 100% | 100% |
| Ordering, Kendall tau | **0.56** (best config) | **−0.21** (worse than random) |
| Exact order rate | 22% | **0%** |
| Invalid order responses | 0 | 2 |
| Wall clock | 58 s | 1,247 s |

**Caption quality is the decisive difference, and it is not a throttling artifact.**
On sequence 103, Phi produced "A person is operating a coffee machine" where
`gpt-4.1-mini` produced "rinsing the portafilter under the espresso machine's water
spout … while pressing a button on the machine." One Phi caption was the single
degenerate token `"A."`. Phi's output is too generic to distinguish one step of a
procedure from another — which is exactly the discrimination this feature needs.

**What the Phi numbers do NOT show:** its subscription quota caps at 20K TPM, which
forced concurrency 1 and produced 144 rate-limit retries. That explains the 21-minute
wall clock and plausibly the 2 caption errors. It does **not** explain the caption
brevity or the sub-random ordering, which are model behaviour on successful calls.

**Conclusion:** `gpt-4.1-mini` is selected for captioning. The cheaper model is not a
viable saving — it fails at the half of the feature that works. Note also that
ordering was sub-random on Phi and only 0.56 on both `gpt-4.1-mini` and `gpt-4.1`,
which further supports F-0006's finding that the ordering ceiling is structural
rather than a matter of model choice.

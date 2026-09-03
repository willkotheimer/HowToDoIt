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

---

## F-0008 — A swallowed migration failure becomes a runtime outage once a migration is required

- **Timestamp:** 2026-09-02T17:10:00Z
- **Severity:** High — latent today, triggered by the first schema change (Task 1.2)
- **Root cause:** `HowToDoItApp/Program.cs` calls `DbSeeder.Seed(...)` at startup, which
  calls `context.Database.Migrate()`. The call is wrapped in a `try/catch` that logs
  the exception and **continues starting the application**. The comment states the
  intent plainly: "a DB hiccup … is logged but never crashes the app: the SPA and read
  endpoints still serve."

  That reasoning is correct for the schema as it stands, where the code does not depend
  on any pending migration. It stops being correct the moment a migration is
  **required** for the running code to function. After ADR-0001 and ADR-0011 add
  `Caption`, `IsCaptionAiGenerated`, `CapturedAt` and `CapturedAtSource` to the entity,
  a failed `Migrate()` leaves the application running with an EF model that references
  four columns the database does not have. Every subsequent read of `StepImages` emits
  a `SELECT` naming them and fails with *Invalid column name*.
- **Why this is worse than a crash:** the failure is silent at boot (one log line) and
  surfaces later as broken reads on the **anonymous public browse path** — the one
  route that has no authentication and the most visitors. A process that refused to
  start would have been noticed immediately and would have left the previous healthy
  instance serving.
- **Deployment context:** migrations are not a separate pipeline step. The API and its
  migrations ship in one artifact and the migration runs at startup, so there is
  correctly **no window** in which new code meets an old schema — provided `Migrate()`
  succeeds. This finding is entirely about the path where it does not.
- **Resolution:** Pending — must be settled **before** Task 1.2 applies the first
  migration. The candidate approaches are to fail fast on migration error rather than
  continue, to distinguish "cannot reach the database" (tolerable, keep serving) from
  "migration did not apply" (fatal), or to gate readiness on schema state via a health
  probe. Choosing between them requires an options analysis under §3.5 and an ADR;
  it is not decided here.
- **Residual risk (projected):** Failing fast trades a silent data-layer outage for a
  refused deployment. That is the better trade — App Service keeps the previous healthy
  instance serving — but it makes a bad migration a visible deploy failure rather than
  a quiet degradation, which is a change in operational behaviour that must be expected
  rather than discovered.
- **Closing test reference:** Pending —
  `HowToDoItApp.Tests/Startup/MigrationFailureTests.cs`,
  `Startup_DoesNotServeRequests_WhenRequiredMigrationHasNotApplied(...)`.

---

## F-0009 — Frontend and API deploy on independent pipeline branches

- **Timestamp:** 2026-09-02T17:10:00Z
- **Severity:** Low — degradation, not breakage, provided the client tolerates it
- **Root cause:** In `azure-pipelines.yml`, `DeployAPI` depends on `ProvisionInfra`
  while `DeployFrontend` depends on `FrontendCI`. These are parallel branches of the
  stage graph, so from a single merge the two artifacts go live at **different times**,
  in an order that is not guaranteed.
- **Consequence for this work:** there is a window in which the new SPA is live against
  the old API. In that window `POST /api/StepImages/analyze` returns 404, and `caption`
  is absent from `StepImage` responses. Neither is fatal *if* the client treats a
  failed analyze as the recoverable "not yet described" state ADR-0003 already
  requires, and renders a missing caption as empty rather than assuming its presence.
  The reverse order (old SPA, new API) is safe, because every server change is additive.
- **Investigated 2026-09-02T17:25:00Z — the repository wires *neither* frontend path
  coherently.** Established facts, all from the committed repository and the live
  subscription:
  1. `Startup.cs` calls `UseDefaultFiles()`, `UseStaticFiles()` and
     `MapFallbackToFile("index.html")`, so the API expects to serve a SPA from
     `wwwroot`.
  2. The API project has **no `wwwroot` directory**, its `.csproj` contains no step
     copying the SPA build into one, and the pipeline's `dotnet publish` publishes only
     the API. `HowToDoIt.ui/build/` is **untracked** (0 files in git).
     Nothing in the repository places an `index.html` where the fallback expects one.
  3. `HowToDoIt.ui/.env.production` sets `VITE_API_BASE_URL=/api`, commented "The SPA
     is served from the same App Service as the API, so calls are same-origin" —
     i.e. the SPA is built to assume App Service hosting.
  4. The pipeline nevertheless deploys the frontend to **Azure Static Web Apps**, a
     different origin, where a same-origin `/api` cannot resolve to this API.
  5. The only Static Web App in the subscription matching the hostname CORS-allowed in
     `Startup.cs` (`proud-mushroom-0c6ba0d10.7.azurestaticapps.net`) is named
     **`Household`** — the *other* application's frontend, not this one's.

  Taken together: the SPA is configured for same-origin hosting that nothing sets up,
  and deployed to a cross-origin host where its configuration cannot work. **How the
  live site actually serves its frontend is not determinable from the repository** —
  it likely depends on a manual `wwwroot` upload, or on the pipeline's
  `AZURE_STATIC_WEB_APPS_API_TOKEN` secret pointing at some other resource. Both are
  outside version control, which is itself the finding.

- **Operator context (2026-09-02):** this is understood to be vestigial — infrastructure
  assembled by hand through the portal and DevOps while learning, with the intent that
  a single web deployment and a single mobile app remain. The dead path is expected to
  be removed, but no removal is scheduled or authorized here.
- **Resolution:** Mitigated by design — the client must tolerate a missing endpoint and
  a missing field, which ADR-0003 already requires for its own reasons. No pipeline
  change is proposed; CI is a §8.2 boundary.
- **Residual risk:** The mitigation is a client-side discipline, not an enforced
  invariant. A future UI change that assumes `caption` is always present would
  reintroduce the problem silently, and only during deploy windows — the hardest time
  to reproduce a bug.
- **Closing test reference:** Pending —
  `HowToDoIt.ui/src/Components/Tests/ImageUploader.test.tsx`,
  `it('surfaces a retryable state when analyze returns 404')`.

---

## F-0010 — Shared Household/HowToDoIt infrastructure has ownership gaps in IaC

- **Timestamp:** 2026-09-02T17:45:00Z
- **Severity:** Medium — no active fault; two latent hazards
- **Investigated:** `HowToDoIt/infra/main.bicep` against `Household/infra/main.bicep`.
  The two applications share infrastructure deliberately, but the templates disagree
  about who owns what.

### 1. One storage account, two templates that both create it

Both files compute the same name from the same expression —
`hhimg${uniqueString(resourceGroup().id)}` — and both deploy into the same resource
group, so **both resolve to the identical storage account**. Neither declares it
`existing`; both declare it as a resource to create, with their own container
(`howtodoit-images` and `chore-images` respectively).

The result is idempotent today only because both templates happen to specify identical
account properties (`Standard_LRS`, `StorageV2`, public blob access, TLS 1.2). Nothing
enforces that. A property changed in one repository is silently re-asserted over the
other's account on the next deployment of either, and the last pipeline to run wins.
Two independent repositories both claiming ownership of one live resource is the
hazard, not the current values.

### 2. Both APIs validate the same Entra audience

Both templates carry the identical authority
(`playbookhousehold.ciamlogin.com/15ccd945-…`) and the identical audience
(`api://8a384714-a967-412d-bb37-f341f851d8ec`). The two APIs therefore accept the
**same tokens**: an access token minted for one validates against the other.

Practical impact today is nil — both are single-writer and the allow-list is the same
address, and `RequireAuthForWritesFilter` gates writes on email regardless. But there
is **no cryptographic separation between the two applications at the auth layer**. If
either ever gains additional users or a divergent writer set, a token for one becomes
a token for the other, and the only thing standing between them is an application-level
email check.

### 3. Unmanaged shared resources

Neither template declares the SQL server (`household-db-server`) or the Static Web App
(`Household` / `proud-mushroom-0c6ba0d10`). Both are portal-created and outside version
control, so neither can be reproduced, reviewed, or reasoned about from either
repository — which is also why F-0009's frontend-hosting question could not be answered
from source.

- **Resolution:** Pending — no action authorized. Infrastructure and CI are §8.2
  boundaries, and the shared resources belong to two applications, so a change here
  reaches beyond this repository's scope.
- **Residual risk:** Item 1 can cause a cross-application configuration change that no
  reviewer of either repository would see in a diff. Item 2 means auth isolation
  currently rests on an application-level allow-list rather than on token audience.
  Item 3 means part of production cannot be rebuilt from source.
- **Closing test reference:** Not code-level. Closed by bringing the shared resources
  under a single owning template with the non-owner referencing them as `existing`, and
  by a recorded decision on whether the two APIs should have distinct audiences.

---

## F-0011 — Frontend CI has never been able to deploy: stale Household e2e tests fail the stage

- **Timestamp:** 2026-09-02T18:15:00Z
- **Severity:** **High** — blocks Task 1.7 (caption UI) from ever reaching production
- **Root cause chain, verified end to end:**

  1. `HowToDoIt.ui/e2e/smoke/routes.spec.ts` was inherited from the Household
     codebase and still tests **Household's** application: it visits `/dashboard`,
     `/assignmentBoard`, `/playbook`, `/chore/1`, and asserts on copy such as
     "THE PLAY BOOK", "REMAINING TASKS", "YOUR HOUSEHOLD", "Chore Details", and the
     `.tpb-hero` / `.tpb-strip` classes.
  2. HowToDoIt's router (`src/Helpers/Routes.tsx`) declares only `/`, `/create`,
     `/sequence/:id` and `/sequence/:id/edit`. None of the routes above exist.
  3. **Executed locally 2026-09-02: 6 of 7 smoke tests fail, 1 passes** (1.8 min).
     Every failure is a Household assertion against a HowToDoIt page.
  4. `azure-pipelines.yml` runs `npm run test:e2e`, which is `playwright test` with no
     path filter — it runs the whole `./e2e` directory, stale specs included. The step
     carries **no `continueOnError`**, so a failure fails the job and the `FrontendCI`
     stage.
  5. `- publish: HowToDoIt.ui/build` is sequenced **after** that step, so the
     `frontend` artifact is never produced.
  6. `DeployFrontend` declares `dependsOn: FrontendCI` with
     `condition: and(succeeded(), …)`, so it never executes.

- **Conclusion:** the frontend has, in all likelihood, **never deployed through the
  pipeline.** The SPA currently served from the App Service `wwwroot` at
  `howtodoit-api.azurewebsites.net` (page title "HowToDoIt", confirmed live) was placed
  there by some means outside this repository, and nothing in version control can
  update it.

- **This also explains F-0009.** The Static Web App at
  `proud-mushroom-0c6ba0d10.7.azurestaticapps.net` still serves page title
  **"Household"** — the other application's frontend — because HowToDoIt's
  `DeployFrontend` has never run. There is no duplicate HowToDoIt frontend and never
  was, and **that Static Web App must not be deactivated: it is Household's live site.**

- **The API is unaffected.** `FrontendCI` declares `dependsOn: []` and the API chain is
  `BackendCI → ProvisionInfra → DeployAPI`, so backend deployments have always
  succeeded independently. Only the frontend half is broken.

- **Resolution:** Pending — no fix authorized. The obvious remedy is to delete or
  rewrite `e2e/smoke/routes.spec.ts` against HowToDoIt's real routes, which is
  repository code rather than a §8.2 boundary, but it changes what gates production
  deployment and should be an explicit decision. Note that `walkthrough.spec.ts` also
  requires a live API at `https://localhost:5001/api`, which the pipeline never starts —
  so fixing the smoke specs alone may not turn the stage green.
- **Residual risk:** Turning `FrontendCI` green will cause `DeployFrontend` to run for
  the first time. Its `AZURE_STATIC_WEB_APPS_API_TOKEN` points at an **unverified**
  resource. If that token resolves to the `Household` Static Web App, the first
  successful run would overwrite Household's live frontend with HowToDoIt's build.
  **That token must be confirmed before the stage is allowed to succeed.**
- **Closing test reference:** `HowToDoIt.ui/e2e/smoke/routes.spec.ts` rewritten against
  the four real routes, with `it('landing page renders the sequence feed')` replacing
  the `.tpb-hero` assertion; green locally and in CI.

### F-0011 addendum — resolved 2026-09-02T18:45:00Z

**Fixed.** Two changes, both repository code:

1. `e2e/smoke/routes.spec.ts` rewritten against HowToDoIt's four real routes. Every
   assertion holds **without an API**, because the pipeline serves the static build
   with no backend behind it — so the suite tests the app shell, the unauthenticated
   denial, and the not-found path rather than sequence data.
2. `package.json`: `test:e2e` now runs `playwright test smoke`. `walkthrough.spec.ts`
   and `screenshots.spec.ts` are screenshot-capture utilities that require a local API
   at `https://localhost:5001` (they failed with `ECONNREFUSED ::1:5001`); they are
   moved to `test:e2e:capture`, with `test:e2e:all` retained for the full suite. This
   removes nothing from CI that ever passed there — those two specs have always
   failed in the pipeline; the change only makes that explicit.

**Verified:** `npm run test:e2e` → **7 passed, exit code 0** (was: 6 of 7 failing).
`npm test` → 19 unit tests pass, unaffected.

**Non-vacuity checked (§7.3).** The suite adds three negative assertions using
`toHaveCount(0)`, which pass just as readily when a selector is simply wrong. A
temporary probe ran the same three selectors with the writer bypass enabled
(`/create?writer=1`) and confirmed each matches exactly one element in that state.
The absence assertions therefore assert the absence of something that provably
exists otherwise. The probe was deleted after use; it is recorded here rather than
left in the suite.

**Residual risk — unchanged and still the important part.** `FrontendCI` can now
succeed, so `DeployFrontend` will execute for the first time. Its
`AZURE_STATIC_WEB_APPS_API_TOKEN` still points at an **unverified** resource.

*Operator context (2026-09-02):* the consequence of that token resolving to the
`Household` Static Web App is accepted — Household is deployed but not published
anywhere, overwriting a Static Web App does not touch its source repository, and the
application is expected to return only through a future convergence of the two apps.
The risk is therefore recorded and accepted rather than blocking. It is **not**
eliminated: a first successful `DeployFrontend` may replace what that Static Web App
serves.

**Still open, and separate:** the SPA served from the App Service `wwwroot` was placed
there outside version control, and `DeployFrontend` targets Static Web Apps while
`.env.production` builds the SPA for same-origin `/api` hosting. Turning the stage
green does not reconcile that contradiction (F-0009); it only unblocks the stage.

---

## F-0012 — Production runs from a hand-deployed blob package; the pipeline has never deployed anything

- **Timestamp:** 2026-09-02T19:10:00Z
- **Severity:** **High** — the CI/CD pipeline does not deploy this application
- **Evidence (read-only queries against the live App Service, `howtodoit-api`):**

  1. **Deployment history contains exactly one entry:** `2026-07-26T13:02:35Z`,
     deployer `OneDeploy`. `OneDeploy` is the deployment API used by
     `az webapp deploy`, i.e. a command-line publish, not a pipeline release.
  2. **`WEBSITE_RUN_FROM_PACKAGE` is a blob SAS URL**, not `1`:
     `https://hhimggdea25tvnuk7c.blob.core.windows.net/app-packages/howtodoit-api.zip?se=2029-07-25…`
     The site therefore mounts and runs a **fixed zip in blob storage**. The
     `AzureWebApp@1` task in `azure-pipelines.yml` sets this setting to `1`, which is a
     different mechanism entirely — so the live configuration is not the one the
     pipeline produces.
  3. `az webapp deployment source show` reports no repository, no branch, and
     `isManualIntegration: false` — no source-control deployment is wired up.
  4. No deployment was recorded on 2026-09-02 despite a merge to `main` that day,
     which the pipeline triggers on.

- **Conclusion.** The live application — API *and* the SPA served from `wwwroot`, which
  is inside that zip — is a **manually published artifact from 2026-07-26**. This
  explains F-0009 (the frontend's origin is untraceable from source) without needing
  any of the hypotheses offered there: it was never deployed by CI because *nothing*
  was. Taken with F-0011, the position is that `FrontendCI` fails and so never
  deploys, and `DeployAPI` has produced no deployment record at all.

- **Consequences that follow:**
  - The running application does not necessarily correspond to any commit. There is no
    recorded link between the deployed zip and a revision of this repository.
  - Merging to `main` does not ship anything, so the deployment risk previously
    attached to merges is smaller than stated — but so is the assurance that a merge
    changes production.
  - When the pipeline is eventually made to work, `DeployAPI` will set
    `WEBSITE_RUN_FROM_PACKAGE` to `1` and push its own package. That is a **change of
    hosting mechanism** on a live site, not a routine deploy, and should be treated as
    such the first time it happens.
  - The SAS in the app setting is readable by anyone with configuration access and is
    valid until **2029**. Long-lived, and worth rotating when the zip is retired.

- **Resolution:** Pending — no action authorized. CI/CD is a §8.2 boundary and this
  reaches into how production is hosted.
- **Residual risk:** Until deployment is reproducible from source, no change reviewed
  in this repository can be assumed to be running, and rollback has no defined
  mechanism beyond re-publishing a zip by hand.
- **Closing test reference:** Not code-level. Closed when a pipeline run deploys a
  known commit and the deployment history records it — the first entry that is not
  `OneDeploy`.

### F-0012 addendum — enabling DeployAPI naively would remove the SPA from production

- **Timestamp:** 2026-09-02T19:30:00Z
- The live zip (F-0012) contains the API **and** the SPA in `wwwroot`; that is what
  serves `howtodoit-api.azurewebsites.net` today.
- The pipeline's artifact does not. `dotnet publish` targets only
  `HowToDoItApp.csproj`; the project has no `wwwroot`, the `.csproj` contains no step
  copying the SPA build into one, and the frontend is published as a **separate**
  artifact destined for Static Web Apps.
- Therefore the first successful `DeployAPI` run would replace a package that includes
  the SPA with one that does not, and `MapFallbackToFile("index.html")` would have no
  file to serve. **Making the pipeline work is not sufficient; it is actively harmful
  until the API publish includes the frontend build.**
- This is the concrete shape of the F-0009 contradiction: `.env.production` builds the
  SPA for same-origin `/api` hosting (correct for the live App Service), while the
  pipeline ships it to a cross-origin Static Web App (where that build cannot work).
  The coherent fix is to copy the frontend build into the API's `wwwroot` before
  `dotnet publish` and to drop or repurpose `DeployFrontend` — recorded as the
  indicated direction, **not** as an authorized change.

---

## Register note — course change 2026-09-02T20:15:00Z (ADR-0012)

Implementation moves to Household/Playbook. This changes the **priority** of several
findings without changing their truth. Nothing below is resolved by the move, and
none of it may be marked resolved on that basis.

- **F-0009, F-0011, F-0012** (frontend hosting contradiction, frontend CI failure,
  hand-deployed production) remain **open and accurate for HowToDoIt**. They leave the
  critical path because HowToDoIt's deployment is now frozen. If HowToDoIt is ever
  deployed again, every one of them applies unchanged — including the F-0012 addendum
  warning that enabling `DeployAPI` would strip the SPA from production.
- **F-0011's fix still stands.** The smoke suite rewrite and the `test:e2e` split are
  real repairs to this repository and remain valid regardless of venue.
- **F-0010 item 2** (shared Entra audience) is **reclassified as intended design** by
  ADR-0014, not resolved. The underlying fact is unchanged; if convergence is abandoned
  the concern returns immediately.
- **F-0010 item 1** (two templates both creating one storage account) is **unchanged
  and now more relevant**: both applications are about to be worked on in earnest.
- **F-0008** (swallowed migration failure) **transfers to Household** and must be
  re-verified there before its first migration, since the same startup pattern may or
  may not be present. It is not closed by the venue change.
- **F-0001 through F-0007** concern the design and the model evaluation. They are
  venue-independent and carry over intact under ADR-0012.

---

## F-0013 — Household has no migration mechanism; ADR-0013's schema change has no delivery path

- **Timestamp:** 2026-09-02T20:35:00Z
- **Severity:** **High** — blocks ADR-0013 (the four columns) in the newly chosen venue
- **Root cause:** Household/Playbook uses EF Core for data access — `HouseholdContext`
  derives from `DbContext`, exposes `DbSet<Images>`, and the repositories query with
  LINQ — but the schema is not managed by EF:
  - There is **no `Migrations/` folder** in the project.
  - `Program.cs` calls neither `Migrate()` nor `EnsureCreated()`; it builds the host and
    runs. There is no seeder.
  - `azure-pipelines.yml` contains no `dotnet ef`, no `database update`, and no `.sql`
    execution step.

  The schema therefore exists only in the live database, created by hand. EF is used to
  *read* a schema it does not *own*.

- **Why this matters now:** ADR-0013 adds four columns to `Images`. In HowToDoIt that
  would have been an ordinary EF migration, because HowToDoIt **does** have a
  `Migrations/` folder and applies migrations at startup. Household has neither, so
  adding a column has no established, reviewable delivery path — and the target is a
  **shared production database** also containing the `howtodoit` schema.

- **The venue trade is now visible in full.** Each application has one half of a
  deployment story:

  | | HowToDoIt | Household |
  |---|---|---|
  | Working CI/CD | **No** (F-0011, F-0012) | **Yes** (verified deploy history) |
  | EF migrations | **Yes** (`Migrations/`, applied at startup) | **No** |

  ADR-0012 chose Household for its CI/CD. That remains the right call — CI/CD is the
  harder half and its absence had an unknown attached — but the pivot is **not free**,
  and this entry records the part that was not visible when it was chosen.

- **Resolution:** Pending — required before any ADR-0013 code. Candidate approaches, to
  be analysed under §3.5 in their own ADR:
  1. Introduce EF migrations with a **baseline** migration that reflects the existing
     schema and is marked as already applied, then add the four columns as the second
     migration. Standard practice, and leaves Household maintainable afterwards.
  2. Hand-write `ALTER TABLE` SQL and update the model to match, continuing the current
     manual practice.
  3. Adopt HowToDoIt's startup-migration pattern — which would import F-0008's swallowed
     failure mode along with it, and must not be done without also fixing that.
- **Residual risk:** Whichever path is taken, the first schema change lands on a
  database **shared with a second application**. A baseline migration generated
  carelessly can emit `CREATE TABLE` for tables that already exist, or reach across into
  the `howtodoit` schema. The generated SQL must be reviewed before it is applied, and
  applied against a restorable copy first.
- **Closing test reference:** Pending — an integration test asserting the four columns
  exist and round-trip on `Images`, plus a review record of the generated migration SQL
  confirming it touches only `dbo` and creates nothing that already exists.

# Plan — AI captioning & auto-ordering, then iOS

Two parts, as requested. Written under the System Governance Specification; clause
references are to that document. Ordered per §9.3: risks, gates and trade-offs
first, routine task lists after.

**Status:** plan only. No implementation code has been written. The decisions this
plan depends on are recorded in [`decisions/ADR.md`](decisions/ADR.md) (ADR-0001
through ADR-0005) and were written before any code, per §3.1 and §3.4.

---

## 1. Read this first — risks, gates, and what is not decided

### 1.1 The verification gate has been run, and it FAILED

**Status as of 2026-09-02T13:05:00Z.** Task 1.0 executed against subscription
`861d741b-…`. Result: **Azure AI Foundry serves no Qwen vision model
pay-per-call.** The only Alibaba model in the catalogue is `qwen3-32b`, which
Microsoft documents as *"Text to text"* — it cannot caption an image. No
vision-capable Alibaba model appears in `centralus`, `eastus`, `eastus2` or
`westus3`. Qwen3-VL is on Foundry only as managed compute: a dedicated GPU VM billed
per core-hour.

This invalidates ADR-0002 **on its own terms**, and the reason matters. Option A was
chosen over Option C precisely because a GPU container was "the single largest cost
line item, incurred before one caption is proven useful." Reaching Qwen3-VL through
Foundry *is that GPU cost*. The managed-identity and in-tenant advantages survive;
the economics that ranked A above C do not.

**Recorded in ADR-0006** with the full command-by-command evidence table, per §1.2
and §3.3 — the prior entry is superseded, never edited or reinterpreted.

**Resolved (2026-09-02T15:30:00Z).** A bake-off across three models on 44 real seed
images selected **`gpt-4.1-mini`**, operator-authorized in **ADR-0008** and registered
in `docs/PROVENANCE.md`. **F-0003 is closed** and the §10.2 publish block is lifted.
Qwen remains the model that would have been preferred — open weights meant
portability and a self-hosting option — and ADR-0008 records plainly that it was ruled
out by availability and standing GPU cost, not by merit.

Related: **F-0005** — the local Azure CLI (2.67.0) cannot query quota or the ML
registry, so GPU quota in `centralus` is *undetermined*. It no longer blocks anything,
since the GPU path was not taken. The catalogue queries were unaffected and returned
real data.

### 1.1b The measured result: the feature splits in two

**Captioning works and is ready to build.** **Auto-ordering does not** — best measured
Kendall tau ≈ 0.56 (≈1 image pair in 5 misordered), and the ceiling is structural
rather than a model choice: `gpt-4.1` scored 0.59 at ~5× the cost, ordering from
pixels scored 0.30, state-aware captions 0.41, and `Phi-4-multimodal` was *worse than
random* at −0.21. Full evidence in **F-0006**.

**Resolved (2026-09-02T16:05:00Z) — ADR-0010.** Ordering comes from **capture time**,
read client-side before `compressImage` destroys it; the model proposes an order only
as a **labelled, unapplied suggestion** when timestamps are missing, identical or
unusable. ADR-0011 adds `CapturedAt` and `CapturedAtSource` to `StepImage`.

The premise this rests on, recorded because it is falsifiable: **people photograph a
procedure as they perform it.** They do not finish the job and then stage a pile of
photos out of sequence. If real usage contradicts that — bulk imports, photos gathered
from several people, documentation assembled after the fact — the fallback becomes the
main path and ADR-0010 needs superseding (§1.2).

### 1.2 Five actions need your explicit authorization before any code (§8.2, §8.3)

| # | Action | Clause | Why it needs a decision from you |
|---|---|---|---|
| A1 | Add two columns to `StepImage` + EF migration | §8.2 (data model) | Already authorized by your choice of the caption option; recorded as ADR-0001. Migration runs against the database **shared with the Household app** — must be confirmed scoped to the `howtodoit` schema before applying. |
| A2 | Add `POST /api/StepImages/analyze` and `PUT /api/StepImages/{id}` | §8.2 (public API contract) | Additive, but they are public contract surface. |
| A3 | Modify `infra/main.bicep` for the Foundry resource + managed identity role | §8.2 (infrastructure) | New billable Azure resource. |
| A4 | Modify `azure-pipelines.yml` for the governance marker check and the mobile build | §8.2 (CI/CD definitions) | Explicitly named as forbidden to change unilaterally. |
| A5 | Create a root `CLAUDE.md` | §1.1a, §1.4 | It would sit at the **top** of the precedence order. Proposed, not written. |

### 1.3 The trade-offs you are accepting

- **Ordering has no ground truth.** EXIF capture time is destroyed client-side
  before upload (F-0001 — `compressImage` re-encodes through a canvas). Order comes
  entirely from model inference over caption text. A confidently wrong order looks
  identical to a right one at the API layer. The mitigation is product-level: the
  order is a suggestion, and your existing reorder controls remain the authority.
- **Two frontends forever.** ADR-0005 keeps the web SPA and adds an Expo client.
  This is the largest ongoing cost in the plan.
- **Mobile auth is a rewrite, not a port.** `@azure/msal-browser` does not run on
  React Native. Part 2 rebuilds sign-in on `expo-auth-session` PKCE and needs a new
  redirect URI registered in Entra — an action only you can take.
- **Model cost scales linearly with photo count** (ADR-0004 Option B is N+1 calls).
  The analyze endpoint caps images per request so one call cannot run up an
  unbounded bill.

### 1.4 Edge cases deliberately left out of scope (§8.1)

Named so they are omissions of record, not oversights: offline capture queue;
drag-and-drop reordering on web (arrow buttons stay); replacing Bootstrap 4 /
React Router 5 in the SPA; regenerating a single caption on demand; multi-writer
access; F-0004 (`Add` cannot honour an explicit `SortOrder` of 0 — logged, left
open by decision).

### 1.5 Client parity: shared endpoints, declared divergences

**Settled by the operator (2026-09-02):** both clients call the **same .NET
endpoints**. The server contract is single and authoritative; there is no mobile
variant of the API.

Below that line, the React Native client will differ from the web client in real
ways. The requirement is **not** that the two match — it is that every difference is
**chosen deliberately, written down, and known before Part 2 starts**, rather than
discovered later as drift. Task 2.0 therefore produces a **Client Divergence
Register** (`docs/CLIENT-DIVERGENCE.md`), and no mobile code is written until each
row below carries a decision.

| Concern | Web today | Mobile — decision needed |
|---|---|---|
| Auth library | `@azure/msal-browser` | Cannot run on RN. `expo-auth-session` PKCE against the same CIAM authority. New redirect URI in Entra. |
| Token storage | MSAL browser cache | `expo-secure-store` (Keychain). Different threat model — record it. |
| Image preprocessing | Canvas re-encode, **strips EXIF** (F-0001) | **The highest-value divergence.** If mobile preserves `DateTimeOriginal`, ordering gains real ground truth. Decide deliberately; do not inherit the web behaviour by accident. |
| CORS | Origin allow-list in `Startup.cs` | Not applicable — native clients send no `Origin`. The allow-list **must not** be widened for mobile. |
| Reorder interaction | Arrow buttons | Native drag gestures — the reason ADR-0005 chose Expo over Capacitor. |
| Type definitions | `src/Types/index.ts` | Shared package, OpenAPI generation, or duplication. §1.1b ranks OpenAPI specs above project docs, which argues for generation — but Swashbuckle is not referenced today and the API emits no OpenAPI file. |
| Data fetching | TanStack Query v4 | Same library is available on RN; confirm rather than assume. |

The type-definition row is the only one still needing an options analysis; the rest
need a recorded choice, not a comparison.

### 1.6 A privacy question that is not technical

User photographs of workplaces routinely contain people, faces, name badges,
customer information, and paperwork. Part 1 begins sending those photographs to a
vision model. Under ADR-0002 Option A they stay inside your Azure tenant, which is
why that option was chosen — but App Store review (Task 2.7) requires an explicit
disclosure that images are processed by an AI model regardless. Flagging it now
because it can change what the app is allowed to claim, and it is cheaper to answer
before the capture UI is built than after.

---

## Part 1 — Captioning and auto-ordering

Every task follows the §6.1 loop: write the test, run it, observe it fail **for the
intended assertion reason** (not an import or syntax error), commit the failing test
as evidence (§6.1.2), then write the minimum implementation. Complex logic is
table-driven per §6.2. Local commands: `dotnet test` and `npm test` (vitest),
matching the existing `BackendCI` / `FrontendCI` pipeline stages.

### Task 1.0 — Verification gate — ✅ RUN, ❌ FAILED

Executed 2026-09-02. No Qwen vision model is available pay-per-call in this
subscription; see §1.1 and ADR-0006 for the evidence table. A superseding ADR has
been appended as required. **F-0003 downgraded to Mitigated**, but not closed — the
§10.1 registry still has no pinned model id, because the replacement is not chosen.

**Closed out 2026-09-02:** `gpt-4.1-mini` selected (ADR-0008), provenance recorded,
F-0003 closed, spare deployments deleted. Live infrastructure is now
`rg-howtodoit` → `cog-howtodoit-dev` → one `gpt-4.1-mini` deployment at 150K TPM,
`GlobalStandard`, **$0 idle**.

**Remaining gate before Part 1 implementation begins:**
1. **Docs are pushed first, as P0** — operator instruction, 2026-09-02. No
   implementation code is authored until the governance documents in `docs/` are
   committed and pushed, and **no push happens until the operator says so.**
2. Ordering scope decision (**ADR-0007**) remains open. Captioning is unblocked and
   can proceed once (1) is satisfied.

### Task 1.1 — Pin the EXIF behaviour *(test only)*

`HowToDoIt.ui/src/Helpers/Tests/compressImage.test.ts` —
`it('strips EXIF metadata from the re-encoded file')`. A regression test that
records known behaviour so no future contributor assumes capture time survives.
**Closes the F-0001 test reference.**

### Task 1.2 — Schema change *(ADR-0001 + ADR-0011, gate A1)*

- **Red:** `HowToDoItApp.Tests/DataAccess/StepImageRepositoryTests.cs` — caption and
  capture-time fields round-trip through add and fetch; `IsCaptionAiGenerated`
  defaults false; `CapturedAt`/`CapturedAtSource` default null.
- **Green:** add `Caption` (`nvarchar(500)`, null), `IsCaptionAiGenerated`
  (`bit`, default `0`), `CapturedAt` (`datetime2`, null) and `CapturedAtSource`
  (short string, null) to `Models/StepImage.cs`; mirror them in
  `HowToDoIt.ui/src/Types/index.ts`; generate **one** EF migration covering both ADRs
  and **verify it targets the `howtodoit` schema** before applying.
- **Marker:** `// Governance-Ref: ADR-0001` on the caption properties and
  `// Governance-Ref: ADR-0011` on the capture-time properties; both cited in the
  migration (§4.1).

### Task 1.2b — Client capture-time extraction *(ADR-0010/0011, gate A2)*

- **Red:** `HowToDoIt.ui/src/Helpers/Tests/captureTime.test.ts` — table-driven:
  JPEG with `DateTimeOriginal` → `exif`; JPEG without → `filetime` from
  `File.lastModified`; non-JPEG → `filetime`; unreadable → null source. Extraction
  must run **before** `compressImage`, since that is what destroys the metadata
  (F-0001).
- **Green:** a `captureTime` helper; `ImageUploader` sends `capturedAt` and
  `capturedAtSource` as optional upload fields. **Timezone semantics fixed at the
  contract — UTC**, so ordering cannot be wrong only intermittently.
- **Note:** an extra dependency may be needed to parse the EXIF APP1 segment; if so it
  is registered in `docs/PROVENANCE.md` at the moment it is added (§10.1).

### Task 1.2c — Server-side capture-time validation *(ADR-0011)*

- **Red, table-driven (§6.2):** future dates, implausibly old dates, all-identical
  timestamps across a batch, missing values, malformed values, and a `filetime` source
  never being treated as a verified capture time. Each rejected or downgraded, none
  silently trusted — capture time is untrusted client input.
- **Green:** validation in the upload path; images failing it persist with a null
  `CapturedAt` so the ordering path degrades to the fallback **detectably**.

### Task 1.2d — Deterministic ordering *(ADR-0010)*

- **Red:** given images with valid `exif` capture times, order is capture order —
  no model call is made at all. Given missing/identical/unusable timestamps, the
  service reports that the fallback is required rather than inventing an order.
- **Green:** ordering by `CapturedAt` in the analysis path, ahead of any model call.
- **Negative assertion (§4.3):** assert **no model request is issued** when capture
  times are sufficient — the cost and correctness win of ADR-0010 is only real if the
  model is genuinely bypassed.

### Task 1.3 — Analysis service *(ADR-0004 + ADR-0009)*

- **Red, table-driven (§6.2):** caption validation — empty response, three
  sentences where two were asked for, over-500 characters, non-JSON, model
  timeout. Ordering validation — ids not in the set, duplicates, missing ids,
  wrong count, empty; each must fall back to upload order and never corrupt.
- **§7.1 requirement:** the mock asserts the **outbound** request shape — that the
  correct image URLs and prompt actually left the service — not merely that a
  canned response was parsed back.
- **Green:** `Services/IImageAnalysisService.cs` +
  `Services/QwenImageAnalysisService.cs`. Parallel per-image caption calls, then one
  text-only ordering call over the captions.
- **§7.1 live cycle:** before this integration is called complete, one test run
  against the real Foundry deployment —
  `HowToDoItApp.Tests/Integration/ImageAnalysisLiveContractTests.cs`. Per §7.2,
  completion is judged on inspected caption text and returned id arrays, not on a
  `200 OK`.
- **Marker:** `// Governance-Ref: ADR-0004`.

### Task 1.4 — Harden `UpdateImageOrder` *(closes F-0002)*

- **Red, table-driven:** cross-step ids, unknown id, missing id, duplicate id,
  empty set — each rejected.
- **Green:** validate the id set is exactly the image set of a single step.

### Task 1.5 — Endpoints *(ADR-0003, gate A2)*

- **Red — negative assertions (§4.3), which are the point of this task:**
  anonymous `POST /analyze` returns 401; authenticated non-allow-listed writer
  returns 403; over the image cap returns 400; **a human-edited caption is never
  overwritten by a re-run** (the assertion ADR-0001's `IsCaptionAiGenerated` flag
  exists to make expressible); no model endpoint or credential appears in published
  build output or logs.
- **Green:** `POST /api/StepImages/analyze` (captions eligible images, computes
  order, persists, returns updated images) and `PUT /api/StepImages/{id}` (persists
  a caption edit). Eligibility: `IsCaptionAiGenerated == true || Caption == null`.
- **Marker:** `// Governance-Ref: ADR-0003`.

### Task 1.6 — Infrastructure *(gate A3)*

`infra/main.bicep`: Foundry project + model deployment; grant the App Service
managed identity the inference role. No key in `appsettings.json` — under ADR-0002
there is no key to store, which is what makes the secrets assertion structural
rather than a scanning exercise.

### Task 1.7 — Web UI

- `Components/StepEditor/index.tsx`: a caption field per image thumbnail, saving on
  blur — the same pattern the step title and description already use.
- `data/stepImageData.ts`: `useUpdateStepImage` and `useAnalyzeStepImages` hooks.
- `Components/Forms/ImageUploader.tsx`: fire analyze once `Promise.all` over the
  uploads resolves; show a "Describing photos…" state; handle the ADR-0003 failure
  case where analysis does not complete (a re-runnable action, not a dead end).
- `Views/SequenceDetail/index.tsx`: render captions under images and use them as
  `alt` text — the accessibility win that falls out of this feature for free.

### Task 1.8 — Governance mechanics *(§4.2, gate A4)*

A marker checker script plus a pipeline step: fail the build if a
`Governance-Ref` cites a non-existent ADR id, or if an ADR marked *Requires Marker*
has no corresponding marker in the repo. Without this, §4 traceability runs on
trust.

### Task 1.9 — Provenance registration *(§10.1)*

Register every new dependency at the moment of addition with pinned version, source
URL, and licence — the Azure inference SDK, and the model identifier from Task 1.0.

---

## Part 2 — React Native (Expo) iOS client

Gated on Part 1 being complete and the API contract stable.

### Task 2.0 — Client Divergence Register *(blocking)*

Produce `docs/CLIENT-DIVERGENCE.md` with a recorded decision for every row in §1.5.
Both clients call the same .NET endpoints; this task exists to make the *client-side*
differences deliberate and legible in advance rather than emergent. The
type-definition row additionally needs a three-option analysis under §3.5 (workspace
package / OpenAPI generation / duplication); the remaining rows need a stated choice
and its rationale. No mobile code until every row is filled.

### Task 2.1 — Scaffold

`HowToDoIt.mobile` Expo + TypeScript app. Register every dependency per §10.1 as it
is added.

### Task 2.2 — Auth *(rewrite, not a port)*

`expo-auth-session` PKCE against the existing CIAM authority. **Requires you to
register a new redirect URI in Entra.** Reads stay anonymous, so browse works before
sign-in — same as web. Note: native clients send no `Origin` header, so the CORS
allow-list in `Startup.cs` needs no change and **must not** be widened for mobile.

### Task 2.3 — Browse and detail screens

Domain rows, sequence cards, step detail with images and captions. Read-only, so it
ships against the anonymous API with no auth dependency.

### Task 2.4 — Capture flow

`expo-image-picker` multi-select and camera → compress → upload → analyze. Mirrors
the web flow. **Decide explicitly whether the mobile client strips EXIF** as web
does — if it preserves capture time, F-0001's residual risk can be closed properly
on mobile and ordering gains real ground truth. That would be a contract change
requiring its own ADR, and it is the single highest-value follow-up in this plan.

### Task 2.5 — Native editing

Gesture-driven reorder for steps and images (the interaction that justified
ADR-0005 over Capacitor), plus caption editing.

### Task 2.6 — Mobile CI *(gate A4)*

An EAS build stage in `azure-pipelines.yml`.

### Task 2.7 — App Store preparation

Apple Developer account, bundle id, privacy manifest, and the App Privacy
disclosure covering photo processing by an AI model (§1.6). **Per §8.3, each store
submission requires explicit, real-time authorization from you — that authorization
is per instance and is not transferable to the next submission.**

---

## Sequencing

```
1.0 GATE ──┬─> 1.1 ─> 1.2 ─> 1.3 ─> 1.4 ─> 1.5 ─> 1.7
           └─> 1.6 (parallel, needs A3)
1.8, 1.9 alongside
        └─> 2.0 GATE ─> 2.1 ─> 2.2 ─> 2.3 ─> 2.4 ─> 2.5 ─> 2.6 ─> 2.7
```

Part 1 delivers a working, shippable web feature on its own. Nothing in Part 2 is
required for it to be useful.

---

# Handover — implementation moves to Household/Playbook

Recorded 2026-09-02 under ADR-0012 (venue), ADR-0013 (entity) and ADR-0015 (register
closure). This section replaces Part 1's task list **for execution purposes**: the
decisions above it still stand, but they are carried out in the other repository.

Everything below is sequenced so that each step is independently verifiable and nothing
touches the shared production database until its migration SQL has been read.

## H0 — Carry the record across *(no code)*

1. Copy `docs/decisions/ADR.md`, `docs/FINDINGS.md` and `docs/PROVENANCE.md` into the
   implementation repository.
2. **Verify the carry-forward by count, not by assumption** (ADR-0015): ADR-0001
   through ADR-0015 and F-0001 through F-0013 must all be present, superseded entries
   included.
3. Move the untracked addendum deliberately — **no git operation will carry it**. Once
   the destination repository is private, it should become a normal tracked file there
   rather than an ignored one; ignoring it in a private repository buys nothing and
   leaves it unversioned and unbacked-up.
4. Numbering continues at ADR-0016 and F-0014.

## H1 — Unblock the schema (F-0013) — **the gating item**

Household uses EF Core to read a schema it does not own: no `Migrations/` folder, no
`Migrate()` call, no CI migration step. ADR-0013's four columns therefore have nowhere
to land yet.

1. **Decide the migration mechanism first, in its own ADR with a §3.5 options
   analysis.** Candidates: an EF baseline plus migrations; hand-written `ALTER TABLE`
   continuing current practice; or adopting a startup-migration pattern — the last of
   which imports F-0008's swallowed-failure mode and must not be chosen without also
   fixing it.
2. If a baseline migration is chosen: generate it, then **read the generated SQL before
   running it.** It must touch only `dbo`, and must not emit `CREATE TABLE` for tables
   that already exist. The database is shared with the `howtodoit` schema.
3. Apply against a restorable copy before production.

**Nothing in H2 onward can proceed until H1 is settled.**

## H2 — Schema change *(ADR-0013)*

- **Red:** caption and capture-time fields round-trip on `Images`;
  `IsCaptionAiGenerated` defaults false; `CapturedAt` / `CapturedAtSource` default null.
- **Green:** the four columns on `Models/Images.cs`, mirrored in the frontend types.
- **Markers:** `// Governance-Ref: ADR-0013` on the properties and in the migration.

## H3 — Analysis service *(ADR-0004, ADR-0008, ADR-0009)*

- **Red, table-driven (§6.2):** caption validation (empty, over-length, non-JSON, wrong
  sentence count, timeout) and ordering validation (ids outside the set, duplicates,
  missing, wrong count, empty) — each falling back without corrupting data.
- **§7.1:** the mock asserts the **outbound** payload, not just a canned response.
- **Green:** `IImageAnalysisService` + the `gpt-4.1-mini` implementation, with the
  bounded concurrency and `Retry-After` backoff ADR-0009 requires.
- **Constraint, now load-bearing:** the service stays **entity-agnostic**, with
  persistence behind an adapter. ADR-0012's rework estimate depends on this; eroding it
  for convenience is a defect, not a shortcut.
- **§7.1 live cycle:** one run against the real deployment before this is called
  complete, judged on inspected caption text — not on a `200 OK` (§7.2).

## H4 — Endpoints *(ADR-0003)*

- **Red — negative assertions (§4.3), the point of this step:** anonymous analyze
  returns 401; an authenticated non-writer returns 403; over the image cap returns 400;
  **a human-edited caption is never overwritten by a re-run**; no model endpoint or
  credential appears in build output or logs.
- **Green:** the analyze endpoint and the caption-update endpoint.

## H5 — Capture time *(ADR-0010, ADR-0011)*

- **Red:** extraction returns `exif` when `DateTimeOriginal` is present, `filetime`
  from `File.lastModified` otherwise, null source when unreadable — and runs **before**
  any canvas re-encode, which is what destroys the metadata (F-0001).
- **Red, server side:** future dates, implausibly old dates, all-identical batches,
  malformed values — each rejected or downgraded, never silently trusted.
- **Green:** client extraction, upload fields with **UTC pinned at the contract**, and
  ordering by `CapturedAt` ahead of any model call.
- **Negative assertion (§4.3):** **no model request is issued** when capture times
  suffice. ADR-0010's cost and correctness win is only real if the model is genuinely
  bypassed.
- **Note:** Household's client may or may not share HowToDoIt's canvas re-encode; that
  must be checked rather than assumed, since F-0001 was specific to this repository's
  `compressImage`.

## H6 — UI

Caption editing per image, an analyze trigger after uploads settle, the ADR-0003
"not yet described" recoverable state, captions rendered as `alt` text, and the
labelled unapplied ordering suggestion for the fallback path (ADR-0010).

## Carried across but not scheduled

- **F-0008** — the swallowed migration failure. HowToDoIt's pattern is **not present**
  in Household, so this transfers as a *constraint on H1* rather than as an existing
  defect: do not introduce startup migration without fail-fast behaviour.
- **F-0010 item 1** — two Bicep templates both creating one storage account. Unchanged,
  and more relevant now that both applications are being worked on.
- **F-0002, F-0004** — repository defects specific to HowToDoIt's `StepImageRepository`.
  They do **not** apply to Household's `ImagesRepository`, which must be reviewed on its
  own terms; the equivalent ordering-validation gap may or may not exist there.

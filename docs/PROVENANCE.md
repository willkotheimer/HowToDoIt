# Provenance Registry

Every external dependency, third-party library, snippet, dataset, media file, and
hosted model introduced into this project, registered at the moment of addition.
Governed by the System Governance Specification §10.1.

**Required per entry:** artifact name, exact pinned version, source URL / registry
origin, and licence classification. Where licensing or provenance cannot be
deterministically verified, the item is flagged as **Owed Provenance Debt** in
`FINDINGS.md` and blocks production build/publish until cleared by a human reviewer
(§10.2).

---

## Hosted models

### gpt-4.1-mini

| Field | Value |
|---|---|
| **Artifact** | `gpt-4.1-mini` |
| **Version** | `2025-04-14` (pinned in the deployment, not floating) |
| **Deployment** | `gpt-4.1-mini` on `cog-howtodoit-dev`, resource group `rg-howtodoit`, region `centralus` |
| **SKU** | `GlobalStandard` — pay-per-token, no standing charge |
| **Publisher / format** | OpenAI, served by Microsoft |
| **Source / origin** | Azure AI Foundry model catalogue, verified present via `az cognitiveservices model list -l centralus` on 2026-09-02 |
| **Licence classification** | **Proprietary — hosted service.** Governed by the Azure / Microsoft Foundry product terms under the subscription agreement. **No distributable model weights and no open-source licence.** |
| **Selected by** | ADR-0008 |
| **Evidence** | F-0006 (44-image evaluation) |

**Licensing note, recorded deliberately.** This is a hosted-inference entitlement, not
a redistributable artifact. There are no weights to vendor, mirror, or self-host, and
no OSI licence applies. The practical consequence is that continuity depends on the
provider's pricing and deprecation schedule rather than on anything held in this
repository — the dependency risk admitted in ADR-0008. The version above is pinned at
the deployment so a provider-side model refresh cannot silently change behaviour
underneath the application.

### Models evaluated and rejected

Deployed only for the ADR-0008 bake-off and **deleted after evaluation**. Listed here
because §10.1 registers artifacts at the moment of introduction, and these were
introduced, used to produce recorded evidence, and removed.

| Artifact | Version | Outcome |
|---|---|---|
| `Phi-4-multimodal-instruct` | 1 | Rejected — caption quality insufficient (F-0006 addendum) |
| `gpt-4.1` | 2025-04-14 | Rejected — ~5× cost, no meaningful gain |
| `gpt-5-mini` | 2025-08-07 | Deployed for an ordering comparison that was superseded before it ran; no results recorded |

### Considered and unavailable

| Artifact | Status |
|---|---|
| Qwen3-VL family | Not available pay-per-call in this subscription; catalogue offers it only via GPU managed compute. See ADR-0006, ADR-0008, F-0003. |
| `qwen3-32b` | Available pay-per-call in `centralus` (`DataZoneStandard`) but documented by Microsoft as **"Text to text"** — cannot accept image input. |

---

## Code dependencies

**None added yet.** No implementation code has been written, so no package has been
introduced. The Azure inference client library required by Task 1.3 will be registered
here with its exact pinned version, registry origin, and licence at the moment it is
added to `HowToDoItApp.csproj` — not retroactively.

---

## Evaluation assets

| Artifact | Origin | Licence / status |
|---|---|---|
| `images-seeds*/` seed photographs | Pre-existing in this repository | Project-owned. Synthetic demonstration imagery, not customer data. |
| Ground-truth step titles and descriptions | `HowToDoItApp/DataAccess/DbSeeder.cs` | Project-owned, human-authored. |

The evaluation harness (`prep_eval_set.py`, `run_eval.mjs`, `reorder_experiment.mjs`,
`order_from_images.mjs`) was written for this project and depends only on the Python
standard library plus Pillow, and on the Node standard library. Should any of it be
promoted into the repository as the Task 1.3 live-contract test, Pillow must be
registered here with its pinned version and licence at that point.

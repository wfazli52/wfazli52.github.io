# Proof Mode

Proof Mode separates recruiter-verifiable evidence from plans and browser-based training simulations.

## Public modes

- **Verified evidence** is the default view. The incident simulator is gated, project cards show evidence status, and only milestones with inspectable links are labeled verified.
- **Simulation** unlocks the interactive command center and restores the training-oriented project wording.
- Press **Alt + P** to switch modes.

## Update a project after completing it

Edit `proof-data.js` only after you have sanitized, public evidence.

1. Find the matching milestone.
2. Change `status` from `planned` to `in-progress` while assembling the evidence package.
3. Add public links to the `evidence` array.
4. Change `status` to `verified` only when the linked artifacts support the listed requirements.
5. Add `verifiedAt` in `YYYY-MM-DD` format.

Example evidence entry:

```js
{
  label: 'Completed connectivity test matrix',
  type: 'Test results',
  href: 'https://github.com/USERNAME/PROJECT/blob/main/tests/TEST_MATRIX.md'
}
```

Do not publish passwords, private IP information from a real employer, device serial numbers, school identifiers, API keys, or unredacted screenshots.

## Files

- `proof-data.js` — status, evidence links, verification requirements, and skill mappings
- `proof-mode.js` — mode switching, evidence ledger, project labels, drawer, filters, and simulator gate
- `proof-mode.css` — responsive visual system and accessibility states
- `script.js` — loads Proof Mode from the correct site root on both the homepage and project pages

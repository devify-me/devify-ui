# @devify/ui Tasks

**Living task list. Use atomic, verifiable items. Commit after each logical step.**

Follow studio/ standards: G&P, Verification Before Completion, citations to `studio/docs/operating-model/`, learn/ for synthesis.

**Scope note**: This is "tools work" per `studio/shared/sergio-layout.md` Scope Rules. Coordinate with studio/ for VEmployee-impacting changes.

## Current Focus — devify-ui#369: AA-correct theme-generator (PR #368)

G&P: Make `tokens/theme-generator.js` derive on-status + dark primary text by
measured WCAG-AA contrast (not a fixed near-black/near-white assumption), so every
seed produces an AA-passing theme. Preserve brand hues — only adjust the on-color/text.

- [ ] Add a contrast-aware on-color selector helper to theme-generator.js (pick black/white/nearest passing tier by measured ratio vs the actual bg)
- [ ] Apply to --dvfy-on-success / -warning / -info / -danger (light + dark)
- [ ] Apply to --dvfy-primary-text vs --dvfy-primary-bg (light + dark — dark CTA is highest-stakes)
- [ ] Regenerate renting-ideal.css via npm run themes:gen
- [ ] Regenerate cyan/pink/light/dark via their generators (drift-check green)
- [ ] Register renting-ideal in check-contrast.js + remove the temporary exclusion NOTE
- [ ] contrast:ci green for ALL themes (incl renting-ideal + -dark)
- [ ] lint + themes:check green
- [ ] Real-browser Playwright: status badges + dark CTA legible; brand hues unchanged before/after
- [ ] Commit (author Jorge, no AI attribution), push, update PR #368 (+Closes #369)

## Backlog

- [ ] ...

## Standing Rules (from studio Operational DNA)

- Atomic items only.
- Verify with fresh evidence in this session.
- Cite standards.
- Escalate per criteria.
- After work: use `studio/skills/learn/SKILL.md` for studio-valuable.

See `studio/` for full constitution. This tool supports studio-scoped VEmployees.
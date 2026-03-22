# Releasing @devify/ui

## Versioning Policy

`@devify/ui` follows [Semantic Versioning](https://semver.org/):

| Change type | Version bump | Example |
|---|---|---|
| Bug fixes, non-breaking improvements | Patch (`0.0.x`) | `0.1.0` → `0.1.1` |
| New components, new tokens, new features | Minor (`0.x.0`) | `0.1.0` → `0.2.0` |
| Breaking attribute renames, token removals, DOM structure changes | Major (`x.0.0`) | `0.x.0` → `1.0.0` |

**Pre-1.0 exception:** While `version < 1.0.0`, minor bumps (`0.x.0`) may contain breaking changes. Each breaking change must include a migration note in `CHANGELOG.md`.

## What Counts as a Breaking Change

- Renaming or removing a component attribute (`variant` → `type`)
- Removing or renaming a CSS custom property (`--dvfy-primary-bg`)
- Changing a component's default DOM structure in a way that breaks existing CSS selectors
- Removing a component entirely
- Changing event names or their `detail` shape

## Release Checklist

1. **Update `CHANGELOG.md`**
   - Move items from `[Unreleased]` to a new `[x.y.z] — YYYY-MM-DD` section
   - Add migration notes for any breaking changes
   - Update the comparison links at the bottom of the file

2. **Bump `package.json` version**
   ```bash
   npm version patch   # or minor / major
   ```

3. **Commit and tag**
   ```bash
   git add CHANGELOG.md package.json
   git commit -m "chore(release): v0.x.y"
   git tag v0.x.y
   git push && git push --tags
   ```

4. **Publish to npm** (when ready)
   ```bash
   npm publish --access public
   ```

## Conventional Commits

All commits use the [Conventional Commits](https://www.conventionalcommits.org/) format. This makes `CHANGELOG.md` maintenance straightforward — group commits by type when writing release notes.

| Prefix | Maps to |
|---|---|
| `feat:` / `feat(scope):` | Added |
| `fix:` / `fix(scope):` | Fixed |
| `refactor:` | Changed |
| `docs:` | Documentation |
| `chore:` | Maintenance (not user-facing) |
| `BREAKING CHANGE:` footer | Breaking Changes section |

## Migration Notes Format

For breaking changes, add a subsection under the version:

```markdown
### Breaking Changes

#### `dvfy-button` — `variant` attribute renamed to `type`

**Before:**
```html
<dvfy-button variant="primary">Click</dvfy-button>
```

**After:**
```html
<dvfy-button type="primary">Click</dvfy-button>
```
```

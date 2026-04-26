## Branching Strategy

- `main` - stable, only merged from other branches
- Feature branches: `feature/*`
- Bugfix branches: `fix/*`
- Refactor branches: `refactor/*`
- Chores: `chore/*`
- Documentation: `docs/*`

## Pull Request Workflow

1. Create branch from `main`.
2. Push commits following **Conventional Commits** (scope is optional, but recommended):
   - `feat(scope): description`
   - `fix(scope): description`
   - `refactor(scope): description`
   - `chore: description`
   - `docs: description`
3. Open PR to `main` and request review.
4. Merge after approval.

## Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commits to allow automatic changelog generation and maintain readable history

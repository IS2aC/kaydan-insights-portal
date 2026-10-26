<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Conventions

- Auth pages keep the split-screen pattern: the shared visual panel lives in
  `src/components/AuthVisual.tsx` and the brand mark in `src/components/Logo.tsx`
  (light + reversed PNGs). Reuse both instead of duplicating markup per page.
- Auth forms are validated client-side and submit without a backend until accounts
  are wired: never claim an account was created or a session was opened.
- Each page owns exactly one `<h1>`; the visual panel uses plain text, not headings.

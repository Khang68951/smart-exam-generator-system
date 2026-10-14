# Research paper — Strict-Bound Verification

APA 7th edition manuscript on verification layers, hallucination reduction, and
measuring a strict-bound rate for SEGS.

| File | Purpose |
|---|---|
| `strict_bound_verification.tex` | The paper. APA7 document class, `stu` (student) mode. |
| `references.bib` | 16 sources in BibTeX, consumed by `biblatex` with `style=apa`. |

## Build on Overleaf (no install)

1. Go to [overleaf.com](https://www.overleaf.com) → **New Project** → **Upload Project**.
2. Upload **both** files together (`.tex` and `.bib`) — biblatex needs the `.bib`
   in the same directory.
3. **Menu** → **Compiler**: `pdfLaTeX`. Leave everything else at its default;
   Overleaf detects `biblatex` and runs `biber` automatically.
4. Press **Recompile**. Two passes may be needed before citations resolve — if
   the first run shows `(citation)` placeholders or an empty reference list,
   press Recompile once more.
5. **Download PDF**.

## Fill in before submitting

Five lines in the preamble are marked `% TODO`:

```latex
\author{Author Name}
\affiliation{Department, University}
\course{Course Code: Course Title}
\professor{Instructor Name}
\duedate{September 9, 2026}
```

## Switching paper type

The class option controls the title page and layout:

```latex
\documentclass[stu,11pt,floatsintext]{apa7}   % student paper (current)
\documentclass[man,11pt,floatsintext]{apa7}   % manuscript, double-spaced
\documentclass[jou,11pt,floatsintext]{apa7}   % typeset two-column journal article
```

`man` and `jou` ignore `\course`, `\professor` and `\duedate`, so those lines can
stay in place.

## Build locally instead

Requires a TeX distribution (MiKTeX or TeX Live) with `apa7`, `biblatex-apa`,
`biber`, `pgfplots` and `booktabs`:

```
latexmk -pdf strict_bound_verification.tex
```

`latexmk` handles the LaTeX → biber → LaTeX → LaTeX sequence on its own.

## Note on the references

Author lists, venues and page numbers were verified against ACL Anthology,
arXiv and publisher pages where available. Model cards and vendor leaderboards
(HHEM, Bespoke-MiniCheck, Vectara) are cited as grey literature and carry
access URLs rather than DOIs; the Vectara leaderboard is a live resource, so its
figures are a snapshot. Spot-check the entries against your course's citation
requirements before submitting.

## Related

An HTML version of the same research, with the layer stack laid out visually,
is published at:
<https://claude.ai/code/artifact/1c3d8fd9-de66-436b-828d-38abcef532cf>

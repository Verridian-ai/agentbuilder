# Claude Design System: Brand, Tokens, UI Patterns, and Implementation

## Executive Summary

Claude’s visual identity blends human-centered warmth with a function-first product philosophy. The brand expresses clarity and craft through minimal, typographically driven assets and a color system tuned for both marketing and product UI. Under the hood, a tokenized, component-driven implementation provides a consistent, accessible experience across light and dark themes. This report synthesizes publicly available guidance and community resources to document how the system works and how teams can implement it in modern web applications.

At the brand level, Anthropic’s mark is intentionally typographic with a distinctive slash—an allusion to code and the future—paired with an illustration language that foregrounds human values. The overall identity emphasizes credibility, restraint, and technical refinement.[^4] For product UI, Anthropic and its partners developed a color system designed to carry this warmth into interfaces while meeting the demands of functional product work.[^4] Implementation-wise, a pragmatic stack has emerged as a de facto standard: React and TypeScript, Tailwind CSS for utility-first styling, and a component foundation built on shadcn/ui, with Lucide React icons. Theming relies on CSS custom properties and a dark-mode class toggled at the root, while spacing and radius tokens are kept deliberately simple to reduce cognitive load and improve maintainability.[^2]

The palette and typography show intentional variance across sources and contexts. Official brand skills publish a neutral foundation—dark, light, mid and light grays—and an orange, blue, and green accent triad.[^1] Independent resources consistently anchor Claude’s primary accent around a warm terra-cotta/peach (#DE7356), with additional website UI colors that can inform product refinements.[^7][^5] Typography in official guidance prioritizes system fonts with Poppins for headings and Lora for body text, falling back to Arial and Georgia respectively.[^1] Marketing identity work by Geist combined Commercial Type’s Styrene with Klim’s Tiempos—an elegant pairing that communicates technical precision with a human touch.[^4] Community implementations default to semantic HTML and Tailwind typographic scales, with guidance to avoid unnecessary overrides.[^2]

Three risks stand out for teams adopting or adapting the system:
- Color variance across sources can introduce inconsistencies in accents and brand perception if not explicitly resolved in a single source of truth.
- Typography conflicts between brand (Poppins/Lora) and marketing identity (Styrene/Tiempos) require deliberate selection for each surface—brand touchpoints versus product UI.
- Dark-mode contrast is sensitive when mixing OKLCH values with hex tokens; rigorous contrast checks are required for text and interactive states to meet WCAG AA.

This report offers a practical path forward: adopt a clear token taxonomy, standardize on a component library and implementation stack, codify accessibility and responsiveness, and establish governance that maintains consistency as the system scales. Where authoritative documentation is incomplete or contradictory, we note the gaps and propose decision frameworks that respect both brand integrity and product needs.[^1][^2][^4]

## Methodology & Source Integrity

This analysis draws from four classes of sources: official materials, design partner case studies, community-led implementations, and third-party palettes. The official Anthropic brand skill provides prescriptive color and typography guidance suitable for artifacts and simple UI surfaces.[^1] The Geist case study is treated as canonical for the marketing identity and its typographic rationale, informing the high-level brand aesthetic.[^4] A community design system built for Claude artifacts offers pragmatic implementation details for web UIs, including CSS variables, Tailwind usage, dark-mode toggling, and component standards based on shadcn/ui.[^2] Third-party sources provide color specifications for Claude’s primary accent and website-inspired palette values; these are treated as directional and require validation against actual brand and product surfaces.[^5][^7]

Where conflicts arise, official and case-study sources take precedence over community and third-party content. Tokenized product UI guidance from the community should inform practical implementation, while brand teams retain authority over logo usage, type selection for marketing, and final accent colors. When direct verification is not possible—particularly for Pantone mappings and certain website colors—we recommend treating third-party values as provisional, then locking them in through internal QA and design sign-off. The live community guide and its repository offer a useful anchor for web UI implementation; they are not official brand specifications but are congruent with Claude’s aesthetic and accessibility goals.[^2][^3]

## Anthropic/Claude Visual Identity Overview

Anthropic’s visual identity began with a clear proposition: align the brand’s human-centered mission with a typographic logo and an illustration language that communicates trust, safety, and craft. The logo is intentionally minimal—a pure typographic wordmark with a single, standout slash detail that references the code underpinning AI and signals a forward-looking stance.[^4] This typographic restraint is complemented by an illustration approach that foregrounds human values, ensuring that complex technical ideas remain consumable for both technical and general audiences.[^4]

Color is used to inject warmth and to serve dual needs: marketing communications and product UI. The color system brings a consistent tonal base into interfaces without sacrificing clarity or function.[^4] This dual mandate is critical for Claude, where the brand must feel approachable yet rigorous, and where UI components carry the burden of daily use. In practice, the system prioritizes neutral foundations with sparing accent usage, reserving saturated hues for actions and feedback states.

Typography in the marketing identity combines Commercial Type’s Styrene with Klim’s Tiempos, pairing technical refinement with a subtle, human quirk. The result is a type system that feels precise but not cold, with a distinct character suited to editorial and product storytelling.[^4] For product surfaces, official brand guidance simplifies font choices to system-available families with Poppins for headings and Lora for body copy, ensuring predictable rendering and fallback behavior across environments.[^1]

## Official Brand Guidelines

Anthropic’s official brand styling skill outlines a focused set of colors and type guidance intended to be applied to artifacts and straightforward UI surfaces. The color guidance establishes neutral foundations and a compact accent set; the typography guidance opts for system-available fonts with clear fallback behavior.

To ground this direction, the following table summarizes the official palette and usage guidance.

To illustrate the official color system and its intended usage, Table 1 enumerates the main and accent colors with recommended roles.

### Table 1. Official Brand Color Palette and Usage

| Role         | Hex / RGB          | Recommended Usage                                      |
|--------------|--------------------|--------------------------------------------------------|
| Dark         | `#141413`          | Primary text and dark backgrounds                      |
| Light        | `#faf9f5`          | Light backgrounds; text on dark                        |
| Mid Gray     | `#b0aea5`          | Secondary elements                                     |
| Light Gray   | `#e8e6dc`          | Subtle backgrounds                                     |
| Orange       | `#d97757`          | Primary accent                                         |
| Blue         | `#6a9bcc`          | Secondary accent                                       |
| Green        | `#788c5d`          | Tertiary accent                                        |

Source: Anthropic Brand Guidelines skill.[^1]

The palette’s restraint is deliberate: neutrals create visual stability, while orange, blue, and green offer distinct, recognizable accents for actions and highlights. In product UI, these accents should be used sparingly to preserve clarity, reserving orange for primary calls-to-action and blue/green for informational and success-oriented feedback.

Typography recommendations in official guidance prioritize predictability and readability by relying on system fonts and sensible fallbacks.

### Table 2. Typography Guidance and Fallbacks

| Text Style | Recommended Font | Fallback     | Notes                                              |
|------------|------------------|--------------|----------------------------------------------------|
| Headings   | Poppins          | Arial        | Apply to headings ≥24pt; preserves hierarchy       |
| Body Text  | Lora             | Georgia      | Optimized for legibility across devices            |

Source: Anthropic Brand Guidelines skill.[^1]

### Color Palette Details

The official brand colors present a cohesive, neutral foundation with measured accent tones. Orange (#d97757) is the primary accent and should anchor primary actions and key highlights. Blue (#6a9bcc) and green (#788c5d) provide secondary and tertiary accents suited to informational and success semantics. Mid and light grays define structure and subtle surfaces. This compact system scales well across surfaces, but teams should avoid saturating interfaces with accent colors—maintain clarity by using neutrals for most surfaces and reserve color for meaning and action.

### Typography & Fallbacks

Applying Poppins to headings and Lora to body text ensures a clean typographic hierarchy with predictable fallback behavior. Headings at 24pt and larger maintain presence without excessive weight; body text in Lora (with Georgia fallback) supports legibility in paragraphs and longer-form content. These recommendations are practical for environments where font installation cannot be guaranteed and serve as a conservative baseline for product UI. Marketing surfaces can adopt more distinctive type (e.g., Styrene/Tiempos), but product teams benefit from the simplicity and reliability of system font stacks.[^1][^4]

## Color Systems & Theme Implementation (Light/Dark)

Community-led implementations complement official guidance by providing a tokenized, CSS-variable approach to product UI theming. The system uses semantic tokens for backgrounds, foregrounds, surfaces, and states, with values specified for both light and dark modes. Importantly, some tokens are expressed in OKLCH—a perceptually uniform color space that can improve gradient transitions and shading—but teams must validate contrast when combining OKLCH with hex values.

To make the mapping explicit, Table 3 summarizes the semantic tokens and their light/dark values.

### Table 3. Semantic Color Tokens: Light vs Dark

| Token               | Light Value            | Dark Value                     | Usage (Tailwind Class)   | Description                                     |
|---------------------|------------------------|--------------------------------|--------------------------|-------------------------------------------------|
| `--background`      | `#ffffff`              | `oklch(0.145 0 0)`            | `bg-background`          | Primary background for pages and containers     |
| `--foreground`      | `oklch(0.145 0 0)`     | `oklch(0.985 0 0)`            | `text-foreground`        | Primary text color with high contrast           |
| `--primary`         | `#030213`              | `oklch(0.985 0 0)`            | `bg-primary`, `text-primary` | Brand color for primary actions and emphasis |
| `--secondary`       | `oklch(0.95 0.0058 264.53)` | `oklch(0.269 0 0)`      | `bg-secondary`           | Secondary background for subtle emphasis        |
| `--muted`           | `#ececf0`              | `oklch(0.269 0 0)`            | `bg-muted`               | Muted background for less prominent elements    |
| `--muted-foreground`| `#717182`              | `oklch(0.708 0 0)`            | `text-muted-foreground`  | Secondary text with lower contrast              |
| `--border`          | `rgba(0, 0, 0, 0.1)`   | `oklch(0.269 0 0)`            | `border-border`          | Border color for dividers and outlines          |
| `--destructive`     | `#d4183d`              | `oklch(0.396 0.141 25.723)`   | `bg-destructive`         | Error and danger states                         |

Source: Community design system tokens and guide.[^2]

These tokens are applied through Tailwind utilities that reference CSS custom properties. For example, `bg-background` maps to `--background`, `text-foreground` maps to `--foreground`, and `border-border` maps to `--border`. The system simplifies theming by keeping the mapping consistent and predictable across components.

Dark mode is toggled by adding a `dark` class to the root element, typically via `document.documentElement.classList.toggle('dark')`. This approach aligns with modern CSS tooling and ensures that theme switching affects all tokenized styles globally.[^2] Because the system mixes OKLCH and hex values, teams must test contrast rigorously for text and interactive states. Focus states should use a dedicated `--ring` token and maintain clear visibility against backgrounds in both themes.[^2]

### Dark Mode Implementation

Adopt a root-level `dark` class to flip token values globally. Ensure all components depend on CSS custom properties—no hardcoded colors. Validate contrast for text and controls, including hover and active states, using automated checks and manual reviews. Focus rings should be sufficiently distinct and respect the `--ring` token, preserving keyboard navigation clarity in both light and dark contexts.[^2]

### Accent Variances & Recommendations

Independent sources converge on a warm terra-cotta/peach as Claude’s primary accent, but they differ on exact values. Table 4 compares the accent specifications across sources and offers recommendations for resolving differences in product systems.

### Table 4. Accent Color Variances Across Sources

| Source                         | Primary Accent (Hex) | Secondary / Website Colors (Hex)                  | Notes                                               |
|--------------------------------|----------------------|---------------------------------------------------|-----------------------------------------------------|
| BrandColorCode (Claude)        | `#DE7356`            | —                                                 | Treat as directional; Pantone mapping is third-party[^7] |
| BeginsWithAI (Logo)            | `#da7756`            | Website background `#eeece2`; Body text `#3d3929`; Chat buttons `#bd5d3a`[^5] | Useful for product UI refinements                   |
| Official Brand Skill           | `#d97757`            | Accents: Blue `#6a9bcc`; Green `#788c5d`          | Conservative baseline for brand surfaces[^1]        |

Recommendation: adopt a single source of truth for the primary accent in product systems. If marketing assets require a specific hue for the logo or hero elements, capture that value in the token file and document its approved use. For product UI, pick a value that meets contrast thresholds and test it in context—particularly for buttons and links. Where variance persists, standardize on the official skill’s orange for brand touchpoints and use a product-accent token (e.g., `--accent-product`) for UI actions. Document the chosen value in the design tokens and ensure downstream components reference semantic tokens rather than raw hex values.[^1][^5][^7]

## Design Tokens: Structure, Naming, and AI-Readability

A robust token taxonomy is the backbone of a scalable system. The community guide demonstrates a clean separation between base (primitive) tokens and semantic tokens, with CSS custom properties bridging the two. Base tokens define raw values—color spaces, spacing scales, radii—while semantic tokens express intent: `background`, `foreground`, `muted`, `border`, `destructive`. This separation simplifies maintenance and improves consistency.

To make the structure concrete, Table 5 outlines the core token categories and their relationships.

### Table 5. Token Taxonomy and Relationships

| Category     | Example Tokens                                | Purpose / Relationship                                      |
|--------------|-----------------------------------------------|--------------------------------------------------------------|
| Base         | `color.gray.100`, `spacing.4`, `radius.md`    | Primitives used to build semantic tokens                     |
| Semantic     | `background`, `foreground`, `muted`, `border`, `destructive` | Intent-driven tokens mapped to components         |
| State        | `focus.ring`, `hover.bg`, `disabled.fg`       | Interaction and accessibility states tied to semantic tokens |
| Component    | `button.bg`, `input.border`, `card.shadow`    | Component-level mappings to semantic/state tokens            |

Source: Community design system tokens and guide.[^2]

AI-readability is crucial when design systems drive code generation or are maintained with the help of AI tooling. Tokens should use semantic names (`color.interactive.primary`), include `description` fields that explain usage, and explicitly declare relationships via `pairedWith` or `usage` fields. Table 6 shows how to document a feedback color token for AI agents.

### Table 6. AI-Readable Token Metadata Example

| Field         | Example Value                                                                                   | Purpose                                                   |
|---------------|--------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| `name`        | `color.feedback.error`                                                                           | Semantic naming by intent                                 |
| `value`       | `#DE3E25`                                                                                        | Actual color value (example)                              |
| `description` | “Use for error messages, destructive button backgrounds, invalid input borders”                  | Explains when and why to use the token                    |
| `usage`       | `[Alert.error, Button.destructive, Input.invalidBorder]`                                         | Lists components tied to this token                       |
| `pairedWith`  | `[color.feedback.errorText, color.feedback.errorIcon]`                                           | Declares related tokens for text and icon                 |
| `a11y`        | “Meets WCAG AA contrast on white (4.5:1); do not use as text on dark backgrounds without check” | Accessibility guidance and constraints                    |

This approach transforms tokens from a wall of nested values into a documented interface definition, enabling AI systems to select correct values and avoid primitive misuse.[^6] Even adding descriptions to the top ten tokens can materially improve AI-generated consistency, reducing cascading errors across components.[^6]

### Quick Wins for AI Readability

Start with high-impact tokens: primary interactive color, error color, text primary color, background color, border color, button padding, input padding, border radius, focus ring color, and disabled state color. Add `description` fields to each and test the system with a simple prompt: build a form with validation and error states using the tokens. Monitor misuse and expand the metadata over time. If the legacy token structure cannot be modified, create companion files—`token-usage-guide.md` and `component-token-map.md`—that AI tools can load alongside existing tokens to understand intent and relationships.[^6]

## Typography Standards

Typography spans three contexts: official brand guidance for artifacts and simple surfaces, marketing identity typography for editorial work, and community implementation defaults for web UI. Official guidance specifies Poppins for headings and Lora for body, with Arial and Georgia fallbacks—prioritizing readability and consistency across environments.[^1] The marketing identity pairs Styrene (Commercial Type) with Tiempos (Klim), achieving a refined, human-centered tone suited to storytelling and brand expression.[^4] Community implementations default to semantic HTML elements with Tailwind’s scale and advise avoiding unnecessary overrides.

Table 7 contrasts these contexts to help teams choose the right stack for each surface.

### Table 7. Typography Contexts and Recommendations

| Context        | Typeface Stack                            | Usage Recommendations                                | Trade-offs                                              |
|----------------|-------------------------------------------|------------------------------------------------------|---------------------------------------------------------|
| Brand (Official)| Poppins (headings), Lora (body); Arial/Georgia fallbacks[^1] | Artifacts, simple UI surfaces; prioritize consistency | Conservative aesthetic; very reliable fallbacks          |
| Marketing      | Styrene (Commercial Type) + Tiempos (Klim)[^4] | Editorial, marketing pages, brand storytelling       | Distinctive character; may require licensed web fonts   |
| Community Web  | Default HTML elements + Tailwind scale[^2] | Product UI components; minimize overrides            | Simple to maintain; aligns with shadcn/ui components    |

Source: Official brand guidance; Geist case study; community design guide.[^1][^4][^2]

In product UI, prefer semantic HTML for typography and avoid overriding unless necessary. Reserve more expressive type choices for marketing contexts where brand character is paramount. For product teams using the community stack, maintain hierarchy through element defaults (e.g., h1–h3, p) and keep line-height at 1.5 for readability.[^2]

## Spacing, Radius, Borders, and Shadows

Spacing and radius values underpin layout consistency and visual cohesion. The community system defines a compact spacing scale and a radius set tuned for modern UI components. Borders use a subtle alpha in light mode; shadows are intentionally restrained to preserve clarity and avoid visual noise.

Table 8 enumerates the spacing scale and common patterns.

### Table 8. Spacing Scale and Usage Patterns

| Scale Values      | Patterns                         | Example Tailwind Classes         |
|-------------------|----------------------------------|----------------------------------|
| `[2, 4, 6, 8, 12, 16, 20, 24]` | Sections, forms, fields, elements | `space-y-8`, `space-y-6`, `space-y-2`, `space-y-4` |

Source: Community design system tokens and guide.[^2]

Table 9 summarizes radius tokens and their mappings.

### Table 9. Border Radius Tokens

| Token       | Value       | Description                          |
|-------------|-------------|--------------------------------------|
| `--radius`  | `0.625rem`  | Default radius                       |
| `rounded-sm`| `6px`       | Small radius                         |
| `rounded-lg`| `10px`      | Large radius (equals `--radius`)     |
| `rounded-xl`| `14px`      | Extra large radius                   |

Source: Community design system guide.[^2]

Table 10 captures border and shadow defaults.

### Table 10. Borders & Shadows

| Token / Class     | Value / Usage                             | Description                             |
|-------------------|--------------------------------------------|-----------------------------------------|
| `--border`        | `rgba(0, 0, 0, 0.1)` (light mode)         | Standard border in light theme          |
| `--border`        | `oklch(0.269 0 0)` (dark mode)            | Standard border in dark theme           |
| `border-border/30`| Class-level usage for subtle borders       | Applies 30% opacity variant             |
| `shadow-sm`       | Default shadow for cards                   | Subtle elevation without clutter        |
| `--ring`          | Focus ring token                           | Ensure visible focus states in both themes |

Source: Community design system guide.[^2]

These defaults strike a balance between presence and restraint. Borders should be subtle; shadows should suggest depth without distracting from content. Focus rings must be obvious and consistent to support accessibility.

## Iconography & Visual Elements

The icon system standardizes on Lucide React, with consistent sizing across small, standard, and large icons. Status and feedback visuals rely on a small set of meaningful icons, enabling clarity without visual clutter.

Table 11 defines icon sizes and common usage.

### Table 11. Icon Sizes and Common Icons

| Size   | Tailwind Class | Typical Usage                          |
|--------|----------------|----------------------------------------|
| Small  | `h-3 w-3` (12px) | Dense data views, compact controls     |
| Standard | `h-4 w-4` (16px) | Default for buttons and alerts         |
| Large  | `h-5 w-5` (20px) | Prominent actions, empty states        |

Common icons include: `Home`, `User`, `Settings`, `Search`, `Menu`, `X`, `ChevronDown`, `ChevronRight`, `ArrowLeft`, `ArrowRight`, `Check`, `AlertCircle`, `Info`, `Loader2`, `Plus`, `Trash2`. Status badges typically adopt semantic colors: green for “Active,” gray for “Pending,” red for “Error,” and outlined styles for “Draft.”[^2]

## UI Components & Interaction Patterns

A consistent component library accelerates development and ensures accessible defaults. The community system anchors on shadcn/ui, imported from `./components/ui/`, and recommends a clear set of variants and states for core components. The stack—React + TypeScript + Tailwind—supports rapid iteration and robust styling through CSS variables.[^2]

To illustrate standards and usage, Table 12 provides a component matrix.

### Table 12. Component Matrix

| Component  | Import Path                                 | Variants / Sizes                                   | Key States                            | Default Classes                       |
|------------|----------------------------------------------|----------------------------------------------------|---------------------------------------|---------------------------------------|
| Button     | `./components/ui/button`                     | Variants: `default`, `outline`, `ghost`, `destructive`; Sizes: `sm`, `default`, `lg`, `icon` | Loading (spinner), with icon          | Variant-driven; rely on tokenized styles |
| Card       | `./components/ui/card`                       | Header, Content, Footer                            | Hover card                            | `border-border/30 shadow-sm`          |
| Input      | `./components/ui/input`                      | Text input; pair with `Label`                      | Focus ring, validation states         | `border-border/30`                    |
| Alert      | `./components/ui/alert`                      | Default, `destructive`                             | Icons: `AlertCircle`, `CheckCircle`, `Info` | Title + Description                   |
| Badge      | `./components/ui/badge`                      | Status styles (Active, Pending, Error, Draft)      | —                                     | Semantic color mapping                 |
| Dialog     | `./components/ui/dialog`                     | Standard dialog                                    | Trigger, footer actions               | Structured header/content/footer       |
| Sheet      | `./components/ui/sheet`                      | Slide-out panel                                    | Trigger                               | Structured header/content              |
| Progress   | `./components/ui/progress`                   | Numeric progress                                   | —                                     | Value-based rendering                  |
| Toast      | `sonner@2.0.3` (external)                    | `success`, `error`, `info`, `loading`              | Dismissable                           | Programmatic calls                     |

Source: Community component specifications and guide.[^2]

### Feedback & Status Patterns

Use `Alert` with `AlertTitle` and `AlertDescription` for system messages; select icons that match semantics (e.g., `AlertCircle` for errors, `CheckCircle` for success). For toasts, `sonner` provides simple APIs for success, error, info, and loading states. Skeleton loaders should be used for content placeholders during data fetching, preserving layout stability and perceived performance. Error states should present clear actions and avoid ambiguous language; success states should be concise and dismissible after acknowledgment.[^2]

## Layout & Responsive Patterns

Consistent layout wrappers and grids minimize bespoke styling and help teams scale interfaces predictably. The community guide defines a main container, standard grids, navigation bars, and responsive breakpoints that integrate with Tailwind’s utility classes.

Table 13 presents the core layout classes.

### Table 13. Layout Classes and Responsive Patterns

| Pattern        | Tailwind Classes                                                | Purpose                                           |
|----------------|------------------------------------------------------------------|---------------------------------------------------|
| Main container | `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8`                    | Standard page wrapper with responsive padding     |
| Card grid      | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`           | Responsive grid for cards and content blocks      |
| Two-column     | `grid grid-cols-1 lg:grid-cols-2 gap-8`                          | Two-column layout for larger screens              |
| Navigation     | `border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-50` | Sticky nav with subtle border and blur     |

Source: Community design system guide.[^2]

Responsive breakpoints follow Tailwind conventions, enabling consistent scaling of text and layout across device sizes.

### Table 14. Responsive Breakpoints

| Prefix | Min-Width |
|--------|-----------|
| `sm:`  | 640px     |
| `md:`  | 768px     |
| `lg:`  | 1024px    |
| `xl:`  | 1280px    |

Source: Community design system guide.[^2]

These patterns should be considered defaults. They reduce decision fatigue and produce interfaces that adapt gracefully across devices.

## Accessibility & Quality Assurance

Accessibility is a first-class requirement. The system’s token structure supports contrast-aware theming, but teams must validate combinations in context. Focus management, semantic HTML, and keyboard navigation must be preserved in both light and dark modes. Automated checks should be paired with manual reviews, especially for states (hover, active, disabled) and dynamic content.

Table 15 lists an accessibility checklist to guide reviews.

### Table 15. Accessibility Checklist

| Area            | Checks                                                                                 |
|-----------------|-----------------------------------------------------------------------------------------|
| Color contrast  | Text meets WCAG AA on background; interactive states tested in light/dark modes        |
| Focus states    | `--ring` visible and consistent; keyboard navigation unimpeded                          |
| Semantics       | Proper use of headings, labels, landmarks; avoid non-semantic divs for interactive UI  |
| States          | Hover, active, disabled styles defined and visible; loading and skeleton states clear   |
| Dynamic content | Toast, alert, and dialog behaviors accessible; ARIA attributes applied as needed        |

Source: Community design system guide and AI-readability practices.[^2][^6]

AI-readability practices—semantic naming, descriptions, and explicit relationships—reduce misuse of tokens by AI generators and improve compliance with accessibility expectations.[^6]

## Implementation Guide: Web Applications

The community stack provides a practical blueprint for implementing a Claude-inspired design in web applications. The core stack is React + TypeScript, Tailwind CSS, shadcn/ui components, and Lucide React icons. Theming is handled via CSS custom properties and a root-level `dark` class. Tokens are defined in `globals.css` and referenced through Tailwind utilities. Layout patterns rely on standard wrappers and grids.

A minimal file structure supports this approach.

### Table 16. Minimal File Structure

| Path                     | Purpose                                     |
|--------------------------|---------------------------------------------|
| `App.tsx`                | Application entry                           |
| `components/ui/*`        | shadcn/ui component imports                 |
| `components/[custom]/*`  | Custom components built on the UI foundation|
| `styles/globals.css`     | CSS custom properties and base styles       |
| `assets/*`               | Images and static assets                    |

Source: Community design system guide.[^2]

### Step-by-Step Setup

1. Initialize a React + TypeScript project with Tailwind CSS. Configure Tailwind to reference the CSS custom properties defined in `globals.css`.
2. Install shadcn/ui components under `components/ui/*` and import them into pages and features as needed.
3. Define CSS variables for semantic tokens (background, foreground, primary, secondary, muted, border, destructive) with light/dark values. Ensure all color usage in components references these variables.
4. Implement theme toggling by adding a `dark` class to the root element. Verify that all components respond correctly to the theme change.
5. Adopt layout wrappers and grids as defaults. Use the spacing and radius tokens consistently.
6. Integrate Lucide React icons and standardize sizes across components.

This setup provides a consistent, maintainable foundation for product teams seeking to implement a Claude-inspired interface with accessible defaults.[^2]

## Risks, Gaps, and Governance

Three risks require explicit governance to maintain consistency and accessibility:

- Color variance across sources. Third-party hex codes and marketing accent values may diverge from official guidance. Governance should establish a single source of truth for product UI accents and document approved values in the token repository.[^1][^7]
- Typography conflicts. Marketing identity typography (Styrene/Tiempos) and official brand guidance (Poppins/Lora) serve different contexts. Define when each stack applies and document the decision in the system’s usage guide.[^1][^4]
- Dark-mode contrast. Mixing OKLCH and hex tokens can produce contrast issues. Enforce a QA process that checks text and interactive states in both themes and prohibits hardcoded colors.[^2]

The following table consolidates these risks and mitigations.

### Table 17. Risk Matrix

| Risk                          | Impact                                      | Mitigation                                                | Owner             |
|-------------------------------|---------------------------------------------|-----------------------------------------------------------|-------------------|
| Color variance across sources | Inconsistent brand perception; contrast issues | Single source of truth in tokens; QA sign-off             | Brand + Design    |
| Typography conflicts          | Mixed tone across surfaces; licensing issues | Context-specific stacks; documentation of usage           | Brand + Product   |
| Dark-mode contrast            | Accessibility regressions                    | Contrast checks; `--ring` enforcement; no hardcoded colors | Frontend + QA     |

Governance should also cover icon library standardization (Lucide React only), component variant usage, and token metadata enrichment to improve AI-readability and maintainability over time.[^2][^6]

## Appendices

### A. Consolidated Color Codes by Source

This appendix consolidates color codes across sources to support token reconciliation.

| Source                         | Dark / Backgrounds       | Light / Text             | Neutrals                        | Accents / States                                  |
|--------------------------------|--------------------------|--------------------------|---------------------------------|---------------------------------------------------|
| Official Brand Skill[^1]       | Dark `#141413`           | Light `#faf9f5`          | Mid `#b0aea5`; Light Gray `#e8e6dc` | Orange `#d97757`; Blue `#6a9bcc`; Green `#788c5d`  |
| Community Tokens[^2]           | Background `#ffffff` (light), `oklch(0.145 0 0)` (dark) | Foreground `oklch(0.145 0 0)` (light), `oklch(0.985 0 0)` (dark) | Muted `#ececf0` (light), `oklch(0.269 0 0)` (dark); `muted-foreground` `#717182`/`oklch(0.708 0 0)` | Destructive `#d4183d`/`oklch(0.396 0.141 25.723)` |
| Third-Party Palette[^7]        | —                        | —                        | —                               | Primary Accent `#DE7356`                           |
| BeginsWithAI (Logo/Website)[^5]| —                        | Body text `#3d3929`      | Website background `#eeece2`    | Chat buttons `#bd5d3a`; Primary logo `#da7756`     |

### B. Complete Token Samples and Mappings

A minimal token file structure (illustrative):

```
{
  "color": {
    "background": { "light": "#ffffff", "dark": "oklch(0.145 0 0)" },
    "foreground": { "light": "oklch(0.145 0 0)", "dark": "oklch(0.985 0 0)" },
    "primary": { "light": "#030213", "dark": "oklch(0.985 0 0)" },
    "secondary": { "light": "oklch(0.95 0.0058 264.53)", "dark": "oklch(0.269 0 0)" },
    "muted": { "light": "#ececf0", "dark": "oklch(0.269 0 0)" },
    "muted-foreground": { "light": "#717182", "dark": "oklch(0.708 0 0)" },
    "border": { "light": "rgba(0, 0, 0, 0.1)", "dark": "oklch(0.269 0 0)" },
    "destructive": { "light": "#d4183d", "dark": "oklch(0.396 0.141 25.723)" }
  },
  "spacing": { "scale": [2, 4, 6, 8, 12, 16, 20, 24] },
  "radius": { "default": "0.625rem", "sm": "6px", "lg": "10px", "xl": "14px" }
}
```

Map tokens to Tailwind via CSS custom properties in `globals.css`, then use utilities like `bg-background`, `text-foreground`, `border-border`. Maintain semantic naming and add metadata for AI-readability as described earlier.[^2][^6]

### C. Example Component Imports

- Button: `import { Button } from "./components/ui/button"`
- Card: `import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"`
- Input: `import { Input } from "./components/ui/input"; import { Label } from "./components/ui/label"`
- Alert: `import { Alert, AlertDescription } from "./components/ui/alert"`
- Icons: `import { AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react"`
- Toast: `toast.success(...)`, `toast.error(...)`, `toast.info(...)`, `toast.loading(...)`

These imports reflect the community standard and provide accessible, consistent building blocks for product interfaces.[^2]

### D. Further Reading and Source Links

See the References section for the full list of sources used in this report.

## Information Gaps

Several gaps remain where official, comprehensive documentation is not publicly available:

- A single, canonical product UI color specification that reconciles differences between brand guidance and third-party hex codes.
- Official, public design system documentation from Anthropic beyond the brand guidelines skill and the Geist case study.
- Authoritative logo usage rules (clear space, minimum size, color-on-color constraints).
- A verified, up-to-date icon library specification from Anthropic; the community standard uses Lucide React.
- A complete, official typography spec for product UI surfaces beyond the brand skill and the marketing identity.
- Hard specifications for motion/animation (duration, easing) and comprehensive accessibility guidance (contrast ratios per state).
- Exact brand color mappings for states (hover, active, disabled) across light/dark themes.

These gaps should be addressed through internal brand governance, product design system stewardship, and QA processes that validate accessibility and consistency across themes and devices.

## References

[^1]: Anthropic Brand Guidelines (Skill) – Official brand colors and typography. https://github.com/anthropics/skills/blob/main/skills/brand-guidelines/SKILL.md  
[^2]: Claude Visual Style Guide & Design System (Community implementation). https://github.com/jcmrs/claude-visual-style-guide  
[^3]: Live Demo – Claude Visual Style Guide. https://jcmrs.github.io/claude-visual-style-guide/  
[^4]: Geist Case Study – Anthropic Visual Identity and Color System. https://geist.co/work/anthropic  
[^5]: Claude AI Logo Colors, Fonts & Assets (Third-party overview). https://beginswithai.com/claude-ai-logo-color-codes-fonts-downloadable-assets/  
[^6]: Design Tokens That AI Can Actually Read (Token metadata for AI readability). https://learn.thedesignsystem.guide/p/design-tokens-that-ai-can-actually  
[^7]: Claude Brand Color Codes (Third-party palette spec). https://www.brandcolorcode.com/claude
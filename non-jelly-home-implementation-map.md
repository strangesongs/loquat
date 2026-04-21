# Non-Jelly Home UI Implementation Map

This map ties each mockup addition to concrete code targets in the current non-Jelly standard mobile (`361-768px`) home flow.

## Quick Wins (Implemented)

1. **Primary entry action now leads with contribution intent**
   - **Target:** `client/sidebar.jsx` in `renderGuestBar()`
   - **Change:** Collapsed guest bar primary button text changed from `sign in` to `add a find`, while still opening auth when needed.
   - **Why:** Emphasizes participation first without adding visual clutter.

2. **Warm, lightweight welcome cue strip**
   - **Targets:** `client/sidebar.jsx`, `client/stylesheets/sidebar.css`
   - **Change:** Added `guest-bar-cue`, `guest-bar-cue-label`, `guest-bar-cue-text` below the collapsed row.
   - **Why:** Adds invitation and purpose with existing olive/earth tokens.

3. **Calmer secondary actions in collapsed state**
   - **Targets:** `client/sidebar.jsx`, `client/stylesheets/sidebar.css`
   - **Change:** Added `guest-bar-links-row` with `sign in · what is fruit for all?` as secondary links.
   - **Why:** Keeps one dominant CTA while preserving discoverability.

4. **Expanded panel hierarchy and spacing refinement**
   - **Targets:** `client/sidebar.jsx`, `client/stylesheets/sidebar.css`
   - **Change:** Added `guest-bar-expanded-kicker`; increased spacing for `guest-bar-expanded-content` and form groups.
   - **Why:** Improves readability and reduces dense stacking.

5. **Reusable about typography classes (inline style cleanup)**
   - **Targets:** `client/sidebar.jsx`, `client/stylesheets/sidebar.css`
   - **Change:** Replaced repeated inline styles with `about-copy`, `about-copy--mobile`, `about-copy-title`, `about-copy-body`, `about-copy-meta`.
   - **Why:** Keeps visual rhythm consistent across guest bar and mobile panel about views.

6. **Trust microcopy for contribution quality**
   - **Targets:** `client/sidebar.jsx`, `client/stylesheets/sidebar.css`
   - **Change:** Added `guest-bar-note` under auth submit button.
   - **Why:** Reinforces public-access policy in a gentle, non-blocking way.

## Follow-Up Polish (Optional)

1. **Extract shared About copy component**
   - **Target:** `client/sidebar.jsx`
   - **Potential:** Reduce duplicated copy between desktop auth panel, standard mobile guest bar, and tiny-screen mobile panel.

2. **Tokenize spacing in `:root`**
   - **Target:** `client/stylesheets/sidebar.css`
   - **Potential:** Add spacing variables for small/medium/large rhythm steps to keep future changes consistent.

3. **Map control/card micro-alignment audit**
   - **Targets:** `client/stylesheets/sidebar.css`, `client/stylesheets/map.css`
   - **Potential:** Ensure top-right map controls and bottom bar feel like one tactile system across all non-Jelly breakpoints.

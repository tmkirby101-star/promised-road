# Isaiah guide portraits

Three matching transparent WebP portraits, 1122 × 1402 pixels.

| File | Intended use |
| --- | --- |
| `isaiah-reading.webp` | Reading or introducing Scripture; original approved reference |
| `isaiah-welcoming.webp` | Welcoming the explorer and inviting the next activity |
| `isaiah-encouraging.webp` | Gentle encouragement, feedback, and chapter recap |

Web paths after integration: `/assets/guides/isaiah/<filename>`.

Use `object-fit: contain`; retain the transparent background. Keep portraits beside dialogue rather than covering the storybook. Isaiah reads and points to Scripture; he is not an eyewitness to Creation. These assets do not add recorded narration or change activity evidence.

This branch contains art only. Merge or cherry-pick its art commit into the current main branch; do not deploy this older branch as the application build.

## Creation notes

The reading portrait is the user-provided reference. The two additional poses were generated with the built-in image generation tool, using that reference to preserve Isaiah's identity, painted texture, cream linen tunic, and deep blue mantle with gold stripe.

Welcoming prompt: same character and painterly style, face lifted toward the viewer, gentle inviting expression, rolled scroll held low in the left hand, right palm extended in welcome; waist-up, transparent background, no text or halo.

Encouraging prompt: same character and painterly style, warm reassuring smile toward the viewer, shoulders in three-quarter turn, hands gently clasped at chest height, no scroll; waist-up, transparent background, no modern gesture, text, or halo.

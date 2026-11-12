# Artes do Modo Réveillon

Criadas com o gerador de imagens integrado (imagegen), usando a mascote oficial como referência de identidade.

## Arquivos utilizados

- `reveillon-banner-v2.png`: panorama do banner.
- `reveillon-avatar-v1.png`: mascote com traje branco e dourado.
- `reveillon-decoracoes-v1.png`: atlas transparente de fogos, presente, taças e fita.
- `reveillon-banner-v1.png`: primeira versão preservada como referência.

A saudação **Feliz 2027** é texto HTML sobre o banner. O ano decorativo não altera a data funcional exibida pelo sistema. As fitas, luzes e fogos complementares são SVGs locais.

## Prompts das artes

### banner

```text
Use case: compositing, identity-preserve. Recompose this exact friendly official SIGEP capybara into an elegant New Year panorama for a government dashboard. Keep recognizable CAPYBARA face, broad dark brown capybara nose, expressive brown eyes, friendly smile with teeth and warm brown fur; this is a capybara, not a jaguar, bear, otter or dog. Replace office and all props with a rich navy blue night sky, detailed gold and white fireworks, tiny glowing gold particles, elegant flowing gold satin ribbons at the bottom. The capybara is in a white formal tuxedo with gold lapels, gold bowtie, white top hat with a gold band, raising one crystal celebratory champagne flute, waist up cheerful portrait. Composition: very wide 3:1 panoramic canvas. CRUCIAL: every main subject must stay within the CENTER HORIZONTAL THIRD of the canvas (34% through 66% of its height), since the website crops it to a shallow banner. The left 35% remains open unobstructed dark navy negative space for live white welcome text. Capybara occupies x35%-49% within that central horizontal band, wearing all requested clothes and fully showing its hat. Leave x52%-72% mostly dark open space for a gold greeting added later in live HTML. At far right x80%-100%, a small softly illuminated stately government palace with palm silhouettes below gold fireworks. Dark nearly empty upper third, dark nearly empty lower third except subtle gold ribbons. Polished detailed luxury New Year greeting-card 3D illustration, soft shadows, glowing but refined, elegant rather than gaudy. No Christmas objects, no Santa hat, no evergreen wreath, no snow, no red. NO TEXT anywhere, no numbers, no logos, no UI, no watermark. The live greeting will be added separately by code.
```

### avatar

```text
Use case: identity-preserve. Convert this existing official SIGEP CAPYBARA mascot into a luxurious New Year circular avatar. Preserve the recognizable capybara face, broad dark brown nose, expressive warm brown eyes, happy smile and front teeth, detailed soft brown fur, friendly polished 3D character. Remove office background, desk, glasses and props. Dress the capybara in a WHITE formal jacket with elegant GOLD lapels, GOLD bow tie, WHITE top hat with a wide shiny GOLD band. Center head and shoulders in a dark NAVY circular interior surrounded by a slim double metallic GOLD circular frame, a few tiny gold stars and small subtle golden fireworks around the frame. Actual transparent alpha background outside the circle and stars. Rich high-quality illustrated luxury New Year style. Keep all frame and hat visible with transparent padding. CAPYBARA only, not a bear, otter, dog or jaguar. No letters, no text, no logos, no Christmas wreath, no evergreen branches, no red, no snow. Square icon asset.
```

### decor

```text
Use case: stylized-concept. Generate ONE square transparent PNG SPRITE ATLAS for an elegant New Year dashboard. Arrange exactly four decorative groups on an invisible TWO by TWO grid, four equal square cells. No grid, no labels, no borders. Genuine transparent alpha around all objects. TOP LEFT CELL: beautiful golden and white fireworks starburst rays with a few tiny golden sparkles, elegant symmetry. TOP RIGHT CELL: a white luxury gift box with a large glossy golden satin ribbon and bow, a few small gold stars at its base. BOTTOM LEFT CELL: two slender crystal champagne flutes celebrating together, filled with golden sparkling beverage, accompanied by a flowing gold satin ribbon and small luminous stars. BOTTOM RIGHT CELL: a gracefully curved flowing strip of gold satin ribbon forming two gentle waves with delicate gold glitter at its base. Each group must fit ENTIRELY in its own cell with at least 10% transparent margin; no overlap across cells. Rich detailed polished photorealistic 3D luxury New Year illustration, white and metallic gold, crisp realistic glass highlights, refined soft local shadows. No background, no confetti clutter, no Christmas objects, no pine, no snow, no red, NO TEXT, NO numbers, NO words, no logo, no UI. Square canvas 1536x1536.
```

### Refinamento do banner

```text
Refine this New Year banner asset for a VERY SHALLOW HEADER CROP. Keep the polished realistic 3D capybara identity, white tuxedo, gold bowtie, white top hat with gold band, raised champagne glass, navy sky, gold fireworks and palace. CRUCIAL CHANGE: shrink the capybara illustration to 42 percent of its CURRENT size and place it at horizontal center 43% of the canvas, with the ENTIRE hat, head, glass and visible upper body fitting between Y=34% and Y=66% of the image height. The capybara must be small within the overall image, NOT a large foreground portrait. Also shrink palace and fireworks to remain within that central horizontal band at far right. Fill the whole upper third with nearly empty dark navy sky and whole lower third with nearly empty dark navy with just a narrow gold ribbon. Leave the left 35% and x54%-72% dark blank areas for live UI text. Remove eyeglasses from the capybara to match the clean festive avatar. NO TEXT, no letters, no numbers, no logos, no UI. Same 3:1 panoramic canvas. Main purpose is to be cropped to the central 180px of a broad website header; if any hat/head/glass is outside the middle third it will be cut off, so keep all subjects small and entirely in that middle third.
```

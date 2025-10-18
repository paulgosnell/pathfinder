# Google Slides Setup Guide - Pathfinder Deck

Quick reference for recreating the HTML pitch deck in Google Slides.

## 1. Initial Setup

### Slide Size
- File → Page Setup → Custom: **10 inches × 5.625 inches** (16:9 ratio)
- This matches the 960px × 540px HTML slides

### Color Palette Setup
Add these to your custom theme colors:

```
Primary Purple:  #7B68EE
Navy (Text):     #2A3F5A
Gray (Body):     #586C8E
Mint:            #E8F5F0
Teal:            #B4E4E0
Lavender:        #E6E6FA
Peach:           #FFD4A3
Cream:           #F9F7F3
White:           #FFFFFF
```

**How to add:**
1. Click any shape → Fill color → Custom → Add each color
2. They'll appear in your color picker for quick access

### Fonts
1. **Quicksand** (headings) - Available in Google Fonts
2. **Atkinson Hyperlegible** (body) - May need to use closest match like **Roboto** or **Open Sans**

**Tip:** If Atkinson isn't available, use **Roboto** (similar readability focus)

---

## 2. Create Master Slide Templates

### Template 1: Title Slide (Gradient Background)

**Layout:**
- Background: Insert → Image → Search for gradient or create gradient using shapes
  - Colors: Mint (#E8F5F0) → Lavender (#E6E6FA) → Teal (#B4E4E0)
- Left half: Image placeholder box
- Right half:
  - Purple accent bar (60px × 4px rectangle, #7B68EE)
  - Title (Quicksand, 56pt, #2A3F5A, Bold)
  - Mission text (Roboto, 17pt, #586C8E)

**Optional decoration:**
- Subtle dot pattern overlay (Insert → Shape → Circle, make tiny, duplicate)
- Abstract blob shape (Insert → Shape → Scribble, adjust)

---

### Template 2: Three-Column Grid (Problem/Needs Slide)

**Layout:**
- Background: Cream (#F9F7F3)
- Purple accent bar top left (60px × 4px)
- Heading: Quicksand, 44pt, #2A3F5A, Bold
- Subtitle: Roboto, 16pt, #586C8E

**Three Columns (equal width):**
Each column is a white card with:
- White background (#FFFFFF)
- Colored top border (4px): Teal, Lavender, or Peach
- Icon placeholder square (48px, gradient fill)
- Card title: Quicksand, 22pt, #2A3F5A
- Bullet list: Roboto, 14pt, #586C8E
- Purple bullets (#7B68EE)

**How to create cards:**
1. Insert → Shape → Rectangle (rounded corners)
2. Add colored line at top (Insert → Line, increase thickness)
3. Duplicate for consistency

---

### Template 3: Two-Column with Icon Bullets (Solution Slide)

**Layout:**
- Background: Cream (#F9F7F3)
- Left column (40%): Purple bar + Title + Description
- Right column (60%): 4-5 icon bullet points

**Icon bullets format:**
- Small square icon box (40px × 40px, gradient fill)
- Text next to icon (Roboto, 13pt, #586C8E)
- Spacing: 20px between bullets

**Gradients for icons:**
- Purple → Teal (#7B68EE → #B4E4E0)
- Lavender → Purple (#E6E6FA → #7B68EE)
- Teal → Peach (#B4E4E0 → #FFD4A3)
- Peach → Lavender (#FFD4A3 → #E6E6FA)

**How to create gradients:**
1. Insert → Shape → Square
2. Fill color → Gradient → Customize
3. Add color stops with hex codes above

---

### Template 4: Horizontal Process Flow (How It Works)

**Layout:**
- Background: Cream (#F9F7F3)
- Title with purple accent bar (top left)
- 4 circular steps in a row

**Each step:**
- Circle (100px diameter, gradient fill, white border)
- Icon inside circle (or screenshot)
- Label below: Quicksand, 20pt, #2A3F5A
- Description: Roboto, 14pt, #586C8E

**Arrows between circles:**
- Insert → Shape → Arrow
- Color: #7B68EE
- 2.5pt stroke

**How to create:**
1. Insert → Shape → Oval (hold Shift for perfect circle)
2. Add border: Border color → White, Border weight → 4pt
3. Duplicate and adjust gradient for each step

---

### Template 5: Timeline/Roadmap (3 Milestones)

**Layout:**
- Background: Cream with subtle gradient (#F9F7F3 → rgba(230, 230, 250, 0.2))
- Horizontal line connecting 3 circles

**Timeline elements:**
- 3 circles (100px, different gradients, white border)
- Label inside: "Y1", "Y2", "Y3" (Quicksand, 28pt, white)
- Title below: Quicksand, 22pt, #2A3F5A
- Description: Roboto, 13pt, #586C8E

**Connecting line:**
- Insert → Line (horizontal)
- Color: Gradient from Teal → Purple → Lavender
- 3pt weight

---

### Template 6: Icon List with Badges (Competitive Moats)

**Layout:**
- Background: Cream (#F9F7F3)
- Left column: Title + subtitle
- Right column: 5 rows of badge + text

**Badge format:**
- Circle (44px diameter, gradient fill, shadow)
- Icon placeholder inside
- Text next to badge (Roboto, 14pt, #586C8E)

**How to add shadow:**
1. Select shape
2. Format options → Drop shadow
3. Adjust opacity and blur

---

## 3. Quick Production Tips

### Efficient Workflow
1. **Create master templates first** (2-3 slides)
2. **Duplicate them** for each new slide
3. **Replace text** but keep formatting
4. **Use alignment guides** (View → Guides)
5. **Group elements** (Ctrl/Cmd + G) to move together

### Icons
Since you can't use SVG Lucide icons directly:
- Use **Google Slides built-in icons** (Insert → Special characters → Search "icon")
- Or leave **icon placeholders** (colored circles) for now
- Or screenshot icons from the HTML deck

### Gradients
- Create one gradient shape
- **Duplicate it** for consistency
- Change colors as needed
- Save frequently used gradients in custom theme

### Collaboration
Once templates are set up:
1. Share with collaborators
2. They can duplicate slides and edit text
3. Templates maintain consistent styling
4. Everyone works in parallel

---

## 4. Slide Order (16 Slides Total)

From the HTML deck:

1. **Title Slide** (Template 1)
2. **The Problem** (Template 2)
3. **The Solution** (Template 3)
4. **Key Features** (Template 3 variation)
5. **Example Conversation** (Custom - screenshot/text)
6. **How It Works** (Template 4)
7. **Roadmap** (Template 5)
8. **Competitive Moats** (Template 6)
9. **Market** (Custom - text + chart)
10. **Business Model** (Custom)
11. **Financials** (Custom - charts)
12. **GTM Strategy** (Custom)
13. **Team** (Custom - photo grid)
14. **Traction** (Custom)
15. **Investment Ask** (Template 1 variation)
16. **Thank You** (Template 1 variation)

---

## 5. Time-Saving Hacks

### Copy Design System from HTML
1. Open HTML deck in browser
2. Screenshot individual slides (Cmd/Ctrl + Shift + 4)
3. Import as background or reference while building in Slides

### Use Master Slide Feature
1. View → Master
2. Edit slide layouts
3. Changes apply to all slides using that layout
4. Saves time if you need to tweak spacing/colors later

### Keyboard Shortcuts
- **Duplicate slide:** Cmd/Ctrl + D
- **Align elements:** Arrange → Align
- **Distribute evenly:** Arrange → Distribute
- **Group:** Cmd/Ctrl + G

---

## 6. What Takes Time vs. What's Quick

**Quick (15-30 mins):**
- Setting up colors and fonts
- Creating 2-3 master templates
- Duplicating slides
- Adding text content

**Slower (1-2 hours):**
- Recreating complex gradients perfectly
- Finding/adding icons
- Building charts (TAM bar chart, financial forecast)
- Fine-tuning spacing and alignment

**My recommendation:**
Start with **Templates 1, 2, and 3** (covers ~60% of slides), then create custom layouts as needed. Get the structure right first, polish later.

---

## 7. Export Options

When finished:
- **File → Download → Microsoft PowerPoint (.pptx)** - For offline editing
- **File → Download → PDF** - For viewing/printing
- **Share link** - For live collaboration

---

## Need Help?

If you want me to:
1. Create the first 3 template slides for you (I can write detailed instructions)
2. Generate color swatches as images
3. Help with specific chart/graphic recreation

Just ask!

# Pathfinder Editable Deck - User Guide

## Overview

The **pathfinder-deck-editable.html** file is an interactive, editable version of your investor pitch deck. It allows you to customize content, reorder slides, and export to PDF—all while preserving the exact design system.

## Quick Start

1. **Open the file** in your web browser:
   - Double-click `pathfinder-deck-editable.html`
   - Or right-click → Open With → Chrome/Safari/Firefox

2. **Click "✏️ Edit Mode"** button (top left)

3. **Start editing!**

---

## Features

### ✏️ Edit Mode

**How to use:**
- Click the purple **"✏️ Edit Mode"** button in the top left
- All text becomes editable (hover to see purple outline)
- Click any text to edit it directly
- Changes auto-save after 2 seconds

**What you can edit:**
- All headings (h1, h2, h3)
- All paragraphs
- All bullet points
- Contact info on the Thank You slide

**What you can't edit:**
- SVG graphics and charts
- Layout/spacing (design is locked)
- Colors and fonts (design system is preserved)

---

### 📋 Slide Controls

When in Edit Mode, each slide shows a control panel in the top right:

| Button | Function |
|--------|----------|
| **📋 Duplicate** | Copy the current slide |
| **🗑️ Delete** | Remove the current slide (disabled if only 1 slide remains) |
| **↑** | Move slide earlier in deck |
| **↓** | Move slide later in deck |
| **💾 Save** | Manually save changes (also auto-saves every 2 seconds) |

**Tips:**
- Use **Duplicate** to create variations of slides
- Use **Delete** to remove slides you don't need (e.g., delete SWOT if not relevant)
- Use **↑↓** to reorganize your deck flow

---

### 👁️ Present Mode

**How to use:**
- Click **"👁️ Present Mode"** to exit editing
- All edit controls disappear
- Use arrow keys (← →) or click buttons to navigate
- Press **Enter Fullscreen** for presenting

**Navigation:**
- **← →** Arrow keys to move between slides
- **Home** key to jump to first slide
- **End** key to jump to last slide
- Click navigation buttons (◄ ►) on sides

---

### 💾 Saving & Storage

**Auto-Save:**
- Changes save automatically to your browser's localStorage
- Saves 2 seconds after you stop typing
- Watch the Edit Mode button turn to "✅ Saved!" briefly

**Manual Save:**
- Click the **💾 Save** button on any slide
- Useful if you want to force a save immediately

**Important Notes:**
- **Data is stored locally** in your browser (not on a server)
- **Clearing browser data** will erase your edits
- **Different browsers** = different saved versions (Chrome vs Safari have separate storage)
- **Export to PDF** (see below) to preserve your work permanently

---

### 📄 Export to PDF

**Steps:**
1. Switch to **Present Mode** (removes edit controls)
2. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows)
3. Choose **Save as PDF** as the destination
4. **Important settings:**
   - Layout: **Landscape**
   - Paper size: **Letter** or **A4**
   - Margins: **None** or **Minimum**
   - Background graphics: **ON**
   - Headers/footers: **OFF**
5. Click **Save**

**Result:**
- Clean PDF with all slides
- No navigation controls or edit buttons
- Perfect for sharing with investors or team members

---

## Common Workflows

### Scenario 1: Customize for Different Audiences
1. Enter Edit Mode
2. Edit text to match audience (e.g., change "UK market" to "US market")
3. Auto-save kicks in
4. Export to PDF with audience-specific filename

### Scenario 2: Create a Short Version
1. Enter Edit Mode
2. Delete slides you don't need (e.g., SWOT, detailed financials)
3. Reorder remaining slides if needed
4. Export to PDF as "Pathfinder-Deck-Short.pdf"

### Scenario 3: Add Custom Slides
1. Enter Edit Mode
2. Navigate to a similar slide (e.g., a text-heavy slide)
3. Click **📋 Duplicate**
4. Edit the duplicated slide's content
5. Use **↑↓** to move it to the right position

### Scenario 4: Collaborate with Team
1. Send the **pathfinder-deck-editable.html** file to teammates
2. Each person can make their own version
3. Review each version and pick the best edits
4. One person creates the final version and exports to PDF

---

## Tips & Best Practices

### ✅ Do's
- **Test in present mode** before exporting to PDF
- **Keep backups**: Export PDF frequently as you work
- **Use duplicate wisely**: Great for creating slide variations
- **Edit in short sessions**: Auto-save works best with frequent pauses

### ❌ Don'ts
- **Don't delete all slides** (at least 1 must remain)
- **Don't edit in multiple browsers simultaneously** (causes conflicts)
- **Don't clear browser cache** without exporting first
- **Don't try to edit SVG charts** (they're visual elements, not text)

---

## Troubleshooting

### Issue: My edits disappeared
**Solution:**
- Check if you're in the same browser
- Try refreshing the page (localStorage should restore)
- Export to PDF regularly to avoid losing work

### Issue: Can't click text to edit
**Solution:**
- Make sure you're in **Edit Mode** (button says "👁️ Present Mode")
- Not all elements are editable (SVG graphics, layout elements)
- Try clicking the actual text, not the container

### Issue: Slide controls are visible in PDF
**Solution:**
- Switch to **Present Mode** before exporting
- Edit controls auto-hide when printing

### Issue: Reordering slides doesn't work
**Solution:**
- The page reloads after reordering (this is normal)
- Your changes are saved and will appear after reload
- If it doesn't work, try manual save (💾) first

### Issue: Duplicate slide creates exact copy
**Solution:**
- That's correct behavior!
- After duplicating, edit the new slide's content
- Duplicate is meant to copy layout, then you customize

---

## Technical Notes

### Browser Compatibility
- **Chrome**: ✅ Full support
- **Safari**: ✅ Full support
- **Firefox**: ✅ Full support
- **Edge**: ✅ Full support

### Storage Limits
- **localStorage limit**: ~5-10MB (plenty for this deck)
- **Slides limit**: No hard limit, but 50+ slides may slow down
- **Text limit**: Essentially unlimited

### Export Quality
- **PDF resolution**: Matches browser viewport (high quality)
- **Fonts**: Embedded in PDF (Quicksand, Atkinson Hyperlegible)
- **Graphics**: Vector SVGs render perfectly

---

## Keyboard Shortcuts

### Navigate
- `←` Previous slide
- `→` Next slide
- `Home` First slide
- `End` Last slide

### Present
- `F11` or `Fn+F` Fullscreen (browser default)

### Edit
- `Cmd/Ctrl + P` Print/Export PDF
- `Cmd/Ctrl + S` Browser save (won't save edits, just HTML file)

---

## Need Help?

### Common Questions

**Q: Can I change colors or fonts?**
A: Not through the UI. You'd need to edit the HTML/CSS code directly in a text editor.

**Q: Can multiple people edit simultaneously?**
A: No, each person has their own local version. Share the HTML file and merge changes manually.

**Q: Can I add images?**
A: Not through the UI. Image placeholders exist—you'd need to edit HTML directly to insert images.

**Q: Will my edits sync across devices?**
A: No, edits are stored per-browser, per-device. Export PDF to share.

**Q: Can I undo changes?**
A: Use `Cmd+Z` / `Ctrl+Z` while editing text. For slide operations, there's no undo—be careful when deleting!

---

## What's Next?

Once you've customized your deck:

1. **Export master PDF** for distribution
2. **Keep the HTML file** as your "source of truth"
3. **Share HTML with collaborators** for further edits
4. **Create versions** for different audiences (investor, team, public)

Your design is preserved perfectly—just focus on the content!

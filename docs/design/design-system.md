# ADHD Support Agent Design System

This document showcases the core design components for the ADHD Support Agent application.

## Color Palette

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <div style="width: 100px; height: 100px; background-color: #F9F7F3; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Cream<br>#F9F7F3
  </div>
  <div style="width: 100px; height: 100px; background-color: #E3EADD; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Sage<br>#E3EADD
  </div>
  <div style="width: 100px; height: 100px; background-color: #D7CDEC; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Lavender<br>#D7CDEC
  </div>
  <div style="width: 100px; height: 100px; background-color: #B7D3D8; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Teal<br>#B7D3D8
  </div>
  <div style="width: 100px; height: 100px; background-color: #F0D9DA; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Blush<br>#F0D9DA
  </div>
  <div style="width: 100px; height: 100px; background-color: #E6A897; border: 1px solid #ddd; border-radius: 5px; text-align: center; padding-top: 40px;">
    Coral<br>#E6A897
  </div>
  <div style="width: 100px; height: 100px; background-color: #2A3F5A; border: 1px solid #ddd; border-radius: 5px; color: white; text-align: center; padding-top: 40px;">
    Navy<br>#2A3F5A
  </div>
  <div style="width: 100px; height: 100px; background-color: #586C8E; border: 1px solid #ddd; border-radius: 5px; color: white; text-align: center; padding-top: 40px;">
    Slate<br>#586C8E
  </div>
</div>

## Typography

### Headings (Quicksand)

<div style="font-family: 'Quicksand', sans-serif;">
  <h1 style="margin-bottom: 10px;">Heading 1 (32px)</h1>
  <h2 style="margin-bottom: 10px;">Heading 2 (24px)</h2>
  <h3 style="margin-bottom: 10px;">Heading 3 (20px)</h3>
  <h4 style="margin-bottom: 10px;">Heading 4 (18px)</h4>
</div>

### Body Text (Atkinson Hyperlegible)

<div style="font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 16px; line-height: 1.6;">
  <p>Primary body text is set in Atkinson Hyperlegible at 16px with a line height of 1.6. This font was specifically designed to increase legibility for readers with low vision, and it's also excellent for those with dyslexia or other visual processing challenges.</p>
  
  <p style="color: #586C8E;">Secondary text is displayed in our slate color to create visual hierarchy without losing readability.</p>
</div>

## Components

### Chat Bubbles

<div style="max-width: 400px; margin: 20px 0; padding: 20px; background-color: rgba(249, 247, 243, 0.5); border-radius: 10px;">
  
  <!-- User Message -->
  <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
    <div style="max-width: 80%; padding: 15px 20px; background-color: #B7D3D8; color: #2A3F5A; border-radius: 18px 18px 4px 18px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05);">
      <p style="margin: 0; font-family: 'Atkinson Hyperlegible', sans-serif;">My 8-year-old takes forever to get ready for school every morning.</p>
    </div>
  </div>
  
  <!-- Agent Message -->
  <div style="display: flex; justify-content: flex-start; margin-bottom: 20px;">
    <div style="max-width: 80%; padding: 15px 20px; background-color: #E3EADD; color: #2A3F5A; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05);">
      <p style="margin: 0; font-family: 'Atkinson Hyperlegible', sans-serif;">I understand how frustrating morning routines can be. Have you tried using a visual schedule to help your child stay on track?</p>
    </div>
  </div>
  
  <!-- Typing Indicator -->
  <div style="display: flex; justify-content: flex-start;">
    <div style="max-width: 80%; padding: 15px 20px; background-color: #E3EADD; color: #2A3F5A; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="display: flex; gap: 4px;">
          <div style="width: 8px; height: 8px; background-color: #D7CDEC; border-radius: 50%; opacity: 0.7;"></div>
          <div style="width: 8px; height: 8px; background-color: #D7CDEC; border-radius: 50%; opacity: 0.5;"></div>
          <div style="width: 8px; height: 8px; background-color: #D7CDEC; border-radius: 50%; opacity: 0.7;"></div>
        </div>
        <span style="font-size: 14px; color: #586C8E; font-family: 'Atkinson Hyperlegible', sans-serif;">Thinking...</span>
      </div>
    </div>
  </div>
  
</div>

### Input Field and Button

<div style="max-width: 400px; margin: 20px 0; display: flex; align-items: center; gap: 10px; padding: 15px; background-color: rgba(249, 247, 243, 0.5); border-radius: 10px; border-top: 1px solid rgba(215, 205, 236, 0.1);">
  <div style="flex-grow: 1; background-color: white; border-radius: 50px; border: 1px solid rgba(215, 205, 236, 0.2); padding: 12px 20px; box-shadow: inset 0 2px 4px rgba(42, 63, 90, 0.03); color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">
    Share what's on your mind...
  </div>
  <div style="width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; background: linear-gradient(to right, #D7CDEC, #B7D3D8); border-radius: 50%; color: #2A3F5A;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  </div>
</div>

### Strategy Card

<div style="max-width: 400px; margin: 20px 0; background-color: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(42, 63, 90, 0.08); border: 1px solid rgba(215, 205, 236, 0.2); overflow: hidden;">
  <div style="padding: 20px; border-bottom: 1px solid rgba(215, 205, 236, 0.1);">
    <h3 style="margin: 0; color: #2A3F5A; font-family: 'Quicksand', sans-serif; font-weight: 600;">Visual Morning Routine Chart</h3>
    <p style="color: #586C8E; margin: 8px 0 0; font-size: 14px; font-family: 'Atkinson Hyperlegible', sans-serif;">For ages 5-8</p>
  </div>
  <div style="padding: 20px;">
    <p style="margin: 0 0 15px; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">Create a visual step-by-step morning routine chart with pictures to help your child stay on track.</p>
    <h4 style="margin: 15px 0 10px; color: #2A3F5A; font-family: 'Quicksand', sans-serif; font-size: 16px;">Implementation Steps:</h4>
    <ul style="margin: 0; padding-left: 20px; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">
      <li>Take photos of your child doing each morning task</li>
      <li>Create a laminated chart with pictures in sequence</li>
      <li>Use checkboxes or velcro stars for completion</li>
      <li>Place chart at child's eye level in bedroom</li>
    </ul>
  </div>
  <div style="background-color: #E3EADD; padding: 15px 20px;">
    <p style="margin: 0; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 14px;">Timeframe: 1-2 weeks to establish</p>
  </div>
</div>

### Header Component

<div style="max-width: 400px; margin: 20px 0; background: linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7)); padding: 20px; border-radius: 16px 16px 0 0; position: relative; overflow: hidden;">
  <div style="position: relative; z-index: 1;">
    <h1 style="margin: 0; color: #2A3F5A; text-align: center; font-family: 'Quicksand', sans-serif; font-size: 28px;">ADHD Support</h1>
    <p style="margin: 5px 0 0; color: #586C8E; text-align: center; font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 14px;">Your AI therapeutic companion</p>
  </div>
  <div style="position: absolute; right: -20px; bottom: -20px; width: 100px; height: 100px; opacity: 0.2;">
    <!-- Placeholder for abstract illustration -->
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path fill="#D7CDEC" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,89.9,-16.3,88.6,-0.7C87.3,14.8,82.2,29.7,74.1,43.1C66.1,56.5,55.1,68.5,41.9,74.7C28.7,80.9,14.4,81.3,-0.3,81.9C-14.9,82.4,-29.8,83.1,-43.2,77.2C-56.5,71.2,-68.3,58.7,-76.9,44.3C-85.6,29.8,-91.1,14.9,-91.6,-0.3C-92.2,-15.5,-87.8,-31.1,-79.4,-43.9C-70.9,-56.7,-58.4,-66.9,-44.5,-74.3C-30.5,-81.8,-15.3,-86.6,-0.1,-86.5C15.2,-86.4,30.5,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
    </svg>
  </div>
</div>

### Button Styles

<div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0;">
  <!-- Primary Button -->
  <div style="background: linear-gradient(to right, #D7CDEC, #B7D3D8); padding: 12px 24px; border-radius: 50px; color: #2A3F5A; font-family: 'Quicksand', sans-serif; font-weight: 600; text-align: center; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.1);">
    Primary Button
  </div>
  
  <!-- Secondary Button -->
  <div style="background: white; padding: 12px 24px; border-radius: 50px; color: #2A3F5A; font-family: 'Quicksand', sans-serif; font-weight: 600; text-align: center; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05); border: 1px solid rgba(215, 205, 236, 0.3);">
    Secondary Button
  </div>
  
  <!-- Call to Action -->
  <div style="background: linear-gradient(to right, #E6A897, #F0D9DA); padding: 12px 24px; border-radius: 50px; color: #2A3F5A; font-family: 'Quicksand', sans-serif; font-weight: 600; text-align: center; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.1);">
    Call to Action
  </div>
</div>

## Background Textures

<div style="display: flex; flex-wrap: wrap; gap: 15px; margin: 20px 0;">
  <!-- Main Background -->
  <div style="width: 200px; height: 100px; background-color: #F9F7F3; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1IiBkPSJNMCAwaDIwMHYyMDBIMHoiLz48L3N2Zz4='); border-radius: 8px; text-align: center; padding-top: 40px; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">
    Noise Texture
  </div>
  
  <!-- Watercolor Header -->
  <div style="width: 200px; height: 100px; background: linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7)); border-radius: 8px; text-align: center; padding-top: 40px; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">
    Watercolor Gradient
  </div>
  
  <!-- Dot Pattern -->
  <div style="width: 200px; height: 100px; background-color: white; background-image: radial-gradient(#586C8E 1px, transparent 1px); background-size: 20px 20px; opacity: 0.1; border-radius: 8px; text-align: center; padding-top: 40px; color: #2A3F5A; font-family: 'Atkinson Hyperlegible', sans-serif;">
    Dot Pattern
  </div>
</div>

## User Interface Example

<div style="max-width: 400px; margin: 30px auto; background-color: white; border-radius: 24px; overflow: hidden; box-shadow: 0 5px 20px rgba(42, 63, 90, 0.1); border: 1px solid rgba(215, 205, 236, 0.2);">
  <!-- Header -->
  <div style="background: linear-gradient(to right, rgba(227, 234, 221, 0.7), rgba(215, 205, 236, 0.7)); padding: 20px; position: relative; overflow: hidden;">
    <div style="position: relative; z-index: 1;">
      <h1 style="margin: 0; color: #2A3F5A; text-align: center; font-family: 'Quicksand', sans-serif; font-size: 24px;">ADHD Support</h1>
      <p style="margin: 5px 0 0; color: #586C8E; text-align: center; font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 14px;">Your AI therapeutic companion</p>
    </div>
    <div style="position: absolute; right: -20px; bottom: -20px; width: 100px; height: 100px; opacity: 0.2;">
      <!-- Placeholder for abstract illustration -->
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#D7CDEC" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,89.9,-16.3,88.6,-0.7C87.3,14.8,82.2,29.7,74.1,43.1C66.1,56.5,55.1,68.5,41.9,74.7C28.7,80.9,14.4,81.3,-0.3,81.9C-14.9,82.4,-29.8,83.1,-43.2,77.2C-56.5,71.2,-68.3,58.7,-76.9,44.3C-85.6,29.8,-91.1,14.9,-91.6,-0.3C-92.2,-15.5,-87.8,-31.1,-79.4,-43.9C-70.9,-56.7,-58.4,-66.9,-44.5,-74.3C-30.5,-81.8,-15.3,-86.6,-0.1,-86.5C15.2,-86.4,30.5,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>
    </div>
  </div>
  
  <!-- Chat Area -->
  <div style="height: 300px; padding: 20px; background-color: #F9F7F3; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1IiBkPSJNMCAwaDIwMHYyMDBIMHoiLz48L3N2Zz4='); display: flex; flex-direction: column; gap: 15px; overflow-y: auto;">
    
    <!-- Assistant Message -->
    <div style="display: flex; justify-content: flex-start; max-width: 90%;">
      <div style="padding: 15px 20px; background-color: #E3EADD; color: #2A3F5A; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05); font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 15px;">
        Hey there! I'm your ADHD support agent. Whether you're overwhelmed, curious, or just need to talk it out, I can help.
      </div>
    </div>
    
    <!-- User Message -->
    <div style="display: flex; justify-content: flex-end; max-width: 90%; align-self: flex-end;">
      <div style="padding: 15px 20px; background-color: #B7D3D8; color: #2A3F5A; border-radius: 18px 18px 4px 18px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05); font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 15px;">
        My 8-year-old takes forever to get ready for school every morning.
      </div>
    </div>
    
    <!-- Assistant Message -->
    <div style="display: flex; justify-content: flex-start; max-width: 90%;">
      <div style="padding: 15px 20px; background-color: #E3EADD; color: #2A3F5A; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 5px rgba(42, 63, 90, 0.05); font-family: 'Atkinson Hyperlegible', sans-serif; font-size: 15px;">
        I understand how frustrating morning routines can be with ADHD children. Would you like me to suggest some strategies that could help make mornings smoother?
      </div>
    </div>
  </div>
  
  <!-- Input Area -->
  <div style="padding: 15px; border-top: 1px solid rgba(215, 205, 236, 0.1); background-color: white;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <div style="flex-grow: 1; background-color: #F9F7F3; border-radius: 50px; border: 1px solid rgba(215, 205, 236, 0.2); padding: 12px 20px; box-shadow: inset 0 2px 4px rgba(42, 63, 90, 0.03); color: #586C8E; font-family: 'Atkinson Hyperlegible', sans-serif;">
        Yes, please share some strategies...
      </div>
      <div style="width: 44px; height: 44px; display: flex; justify-content: center; align-items: center; background: linear-gradient(to right, #D7CDEC, #B7D3D8); border-radius: 50%; color: #2A3F5A; cursor: pointer;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
    </div>
  </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
/* Atkinson Hyperlegible would need to be added from its source */
</style>
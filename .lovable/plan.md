
# Plan: Fix Dashboard Page Responsiveness

## Summary
Update the Dashboard page to match the responsive design patterns implemented in the Insights page, ensuring consistent mobile-friendly layouts across both pages.

## Changes Required

### 1. Stats Cards Grid Layout
**File:** `src/pages/Dashboard.tsx`

Update the stats cards container from:
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
```
To:
```
grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4
```

This ensures 2 columns on mobile instead of 1, matching the Insights page.

### 2. Card Content Padding
Update all stat card `CardContent` components from fixed padding to responsive:
- From: `pt-6`
- To: `p-3 sm:pt-6 sm:px-6`

### 3. Icon Container Padding
Update the icon container divs:
- From: `p-3 rounded-xl`
- To: `p-2 sm:p-3 rounded-xl`

### 4. Icon Sizes
Update all stat card icons to use responsive sizing:
- From: `h-6 w-6`
- To: `h-5 w-5 sm:h-6 sm:w-6`

### 5. Text Sizes
Update labels and values:
- Labels: From `text-sm` to `text-xs sm:text-sm`
- Values: From `text-2xl` to `text-lg sm:text-2xl`
- Currency symbols: From `text-xl` / `text-lg` to `text-base sm:text-xl` / `text-sm sm:text-lg`

### 6. Card Layout Direction
Change card content layout to be more compact on mobile:
- From: `flex items-center gap-4`
- To: `flex items-center gap-2 sm:gap-4`

### 7. Add Container Padding
Add responsive horizontal padding to the main container:
- From: `animate-fade-in space-y-6`
- To: `animate-fade-in space-y-4 sm:space-y-6 px-1 sm:px-0`

### 8. Bank Chart Responsiveness
Update the bank chart section:
- Card header padding: Add `p-3 sm:p-6`
- Chart height: From fixed `h-64` to `h-[180px] sm:h-64`
- Reduce bottom margin on mobile for XAxis labels

### 9. Dashboard Selector Card
Update padding from fixed to responsive:
- From: `pt-6`
- To: `p-3 sm:pt-6 sm:px-6`

### 10. Table Card Header & Actions
Make the action buttons wrap better on mobile:
- Add smaller button sizes on mobile
- Reduce gaps on smaller screens

---

## Technical Details

These changes follow the exact same responsive patterns used in the Insights page:
- 2-column grid on mobile (vs 4 on desktop)
- Smaller padding, text, and icons on mobile
- Reduced gaps and spacing
- Subtle hover effects that don't cause layout shifts on touch devices

All changes use Tailwind's responsive prefixes (`sm:`, `lg:`) to progressively enhance the layout for larger screens.

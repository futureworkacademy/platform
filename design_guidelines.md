# Design Guidelines: The Future of Work Simulation

## Design Approach
**Reference-Based**: Bloomberg Terminal + Harvard Business School simulations aesthetic
- Professional business intelligence platform with subtle gamification
- Data-dense executive dashboard meets educational simulation
- Serious analytical tool with clear progression feedback

## Core Design Elements

### Typography
- **Primary**: IBM Plex Sans (headings, UI labels, navigation)
- **Secondary**: Inter (body text, descriptions, briefing content)
- **Monospace**: Roboto Mono (financial figures, metrics, data tables)
- **Scale**: text-4xl/3xl/2xl/xl/lg/base/sm
- **Weights**: 700 (headings), 600 (subheadings), 500 (labels), 400 (body)

### Color System
- **Primary**: #1E3A8A (corporate navy) - headers, primary actions, navigation
- **Secondary**: #10B981 (growth green) - positive indicators, success states
- **Warning**: #F59E0B (caution amber) - alerts, attention items
- **Accent**: #6366F1 (tech purple) - gamification elements, badges, highlights
- **Background**: #F8FAFC (professional grey) - main background, cards
- **Data Positive**: #34D399 - upward trends, gains
- **Data Negative**: #EF4444 - downward trends, losses
- **Neutrals**: slate-100/200/300/700/800/900 for borders, secondary text

### Layout System
**Spacing**: Tailwind units of 2, 4, 6, 8, 12, 16, 20 (p-4, gap-6, mb-8, etc.)
**Grid Structure**: 
- Dashboard: 12-column grid with 3-4 column cards
- Briefing view: 2-column layout (8-4 split) for content + insights
- Leaderboard: Full-width table with sticky headers

### Component Library

**Dashboard Cards**
- White background (bg-white), subtle shadow (shadow-md), rounded borders (rounded-lg)
- Header with icon + title in navy
- Metric display: Large numbers in Roboto Mono with color-coded trend indicators
- Sparkline charts for historical context

**Intelligence Briefing**
- Document-style layout with serif-like headers
- Article cards: bordered, subtle background (bg-slate-50)
- Insight tags: Small pills with accent colors
- Reading progress indicator

**Data Visualization**
- Line charts for sentiment trends over time
- Bar charts for department comparisons
- Dual-axis charts combining financial + cultural metrics
- Color-coded: green (positive), red (negative), amber (caution), purple (neutral)

**Leaderboard**
- Striped table rows (alternate bg-slate-50)
- Team position badges with accent color
- Dual score columns: Financial | Cultural
- Rank change indicators (↑↓ arrows)

**Navigation**
- Top bar: Logo left, team name center, week progress right
- Sidebar (collapsed on mobile): Dashboard, Briefings, Decisions, Leaderboard, Analytics
- Active state: navy background with white text

**Decision Interface**
- Step-by-step decision cards
- Budget allocation sliders with real-time impact preview
- Confirmation modals with impact summary
- Submit button: Primary navy with pulse animation on deadline

**People Analytics**
- Sentiment heatmap by department
- Issue tracker with priority flags (amber/red)
- Behavior timeline with trend annotations
- Employee segment breakdown (pie/donut charts)

### Gamification Elements (Subtle)
- Week progress bar with milestone markers
- Achievement badges (small, corner placement)
- Score delta indicators (+/- from previous week)
- Leaderboard position change highlights
- NO heavy animations or game-like graphics

### Images
**No hero image** - This is a business simulation tool, not a marketing site
**Icons**: Use Heroicons throughout for consistency
**Charts**: Use Chart.js or Recharts with custom color palette
**Avatars**: Team/player initials in colored circles (accent color)

### Responsive Behavior
- Desktop: Full dashboard with sidebar, multi-column cards
- Tablet: Collapsed sidebar, 2-column card grid
- Mobile: Single column, bottom navigation, stacked metrics

### Accessibility
- WCAG AA contrast ratios (navy on white, white on navy)
- Keyboard navigation for all decisions
- Screen reader labels for all data points
- Focus indicators: 2px accent purple ring
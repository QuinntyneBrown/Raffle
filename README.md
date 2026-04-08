# Raffle

A web application for hosting live raffle drawings with animated name reveals and a back office for administration.

## Features

### Public Raffle Page
- Draw names from the active raffle with a prominent "Draw" button
- Animated name cycling that rapidly shuffles through candidates, decelerates, and lands on the winner (3-6 seconds)
- Celebratory reveal effects (confetti, fireworks, sparkles) on winner announcement
- Live draw history displayed in chronological order
- Remaining name count updates after each draw
- Informational message when no raffle is active

### Back Office Administration
- Create, edit, and delete raffles with unique names and participant lists
- Configure per-raffle page heading and optional subheading
- Choose from multiple visual themes (e.g., Classic, Festive, Corporate)
- Choose from multiple animation styles (e.g., Slot Machine, Wheel Spin, Card Flip)
- Reset draws to return all names to the pool
- View detailed raffle status including drawn/undrawn names and draw history

### QR Code Participant Entry
- Public page displays a QR code linking to a self-registration page
- Participants scan the QR code and enter their name to join the active raffle
- Entries are accepted while the raffle is active and before drawing begins
- Once the first name is drawn, new entries are automatically blocked

### Raffle Activation
- Set exactly one raffle as active at a time
- Activate/deactivate raffles with immediate effect on the public page

### Security
- Authentication required for all back office access
- Secure session management with automatic expiration
- OWASP Top 10 protections including input validation, CSRF tokens, and security headers
- HTTPS enforcement with HSTS

### Accessibility
- WCAG 2.2 Level AA compliant
- Full keyboard navigation with visible focus indicators
- Screen reader support with ARIA live regions for draw results
- Respects `prefers-reduced-motion` for all animations
- Minimum 4.5:1 contrast ratio for text

### Responsive Design
- Fully functional across all viewport sizes (xs through xl)
- Touch-friendly targets (minimum 44x44 CSS pixels) on small screens
- Adaptive layouts for both the public page and back office

## Documentation

- [L1 — High-Level Requirements](docs/specs/L1.md)
- [L2 — Detailed Requirements](docs/specs/L2.md)

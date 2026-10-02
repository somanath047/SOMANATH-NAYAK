# Somanath Nayak — Portfolio

A responsive, single-page portfolio for Somanath Nayak, built with plain HTML, CSS, and JavaScript. Its visual direction is a dark “Field Signal” interface with chartreuse accents, Space Grotesk and DM Mono typography, and a cursive name signature.

**Repository:** [github.com/somanath047/SOMANATH-NAYAK](https://github.com/somanath047/SOMANATH-NAYAK)

The current interface is the SOMANATH.OS v2 redesign: a personal technical product interface inspired by developer tools, operating-system command bars, and restrained cybersecurity dashboards.

## Features

### Visual design and navigation

- Responsive layouts for mobile, tablet, and desktop.
- Sticky navigation with an active-section indicator and a mobile hamburger menu.
- Dark and light themes, with the selected theme saved in `localStorage`.
- Loading / boot-screen animation and top-of-page scroll progress indicator.
- Cursor-following ambient particle canvas on pointer devices.
- Custom cursor glow, magnetic buttons, hover states, and click ripple feedback on desktop.
- Scroll-triggered reveal animations, with reduced-motion preferences respected.
- Animated technology marquee.
- Floating back-to-top control.
- SOMANATH.OS technical shell with floating navigation, animated grid lighting, and responsive system metadata.
- Ctrl/Cmd+K command palette with searchable navigation to portfolio sections, terminal, resume, and GitHub.

### Hero and profile

- Cursive Somanath Nayak signature and animated role text.
- Circular profile portrait with a fallback initials badge if `profile.jpg` cannot load.
- Animated orbital decoration and interactive pointer tilt on desktop.
- Clickable field-scan status card with animated signal bars and completion toast.
- Calls to action for selected projects, a resume download, and a CV download.
- Compact identity strip for current focus, stack, location, and placement availability.
- Expandable profile-status panel describing current learning and project-practice focus without implying live backend telemetry.

### Portfolio sections

- **About:** profile image, introduction, approach, animated highlight counters, and live learning/building status.
- **Skills:** interactive radar-style visualization and categorized technology tags.
- **Career signal map:** keyboard-accessible pathway linking Python, backend development, databases, security learning, and relevant projects/coursework.
- **Projects:** category filters, live text search, case-study mode, pointer tilt, and accessible detail dialogs with project-specific scope, structure, access, and practice notes.
- **Terminal:** interactive commands with command history (arrow keys) and tab completion. Available commands: `help`, `about`, `skills`, `projects`, `learning`, `contact`, `resume`, `cv`, `whoami`, `clear`, and `sudo hire-me`. `sudo coffee` is a small hidden joke.
- **Experience:** scroll-animated timeline for internships, training, student partnership, and cybersecurity study.
- **Learning lab:** clearly labeled cybersecurity learning areas and a build log based on the supplied education, roles, and project history.
- **Certifications:** keyboard-accessible interactive flip cards.
- **Education:** responsive education timeline/list.
- **GitHub / Stats:** a direct link to the GitHub profile and a decorative build-progress snapshot.
- **Contact:** email, LinkedIn, GitHub profile link, copy-email control, and a validated contact form that opens an email draft.
- **Footer:** current year and back-to-top link.

## Files

```text
index.html          Page structure and portfolio content
style.css           Theme, layout, responsive styles, and animations
script.js           Interactions and progressive enhancements
profile.jpg         Profile photo used in the hero section
gg.jpg              Profile photo used in the About section
Somanath_resume.pdf  Resume PDF used by the download link
Somanath_CV.pdf     CV PDF used by the download link
```

## Run locally

1. Keep `index.html`, `style.css`, `script.js`, `profile.jpg`, and `gg.jpg` in the same folder.
2. Keep `Somanath_resume.pdf` and `Somanath_CV.pdf` in the same folder for the separate resume and CV download buttons.
3. Open `index.html` in a modern browser. No build step or JavaScript framework is required.

Google Fonts are loaded from Google Fonts when an internet connection is available; fallback fonts are used otherwise. Contact form submission uses `mailto:` and requires a configured email app.

## Customize

- Update biography, project descriptions, education, and contact details in `index.html`.
- Edit the color variables near the top of `style.css` to adjust the dark and light palettes.
- Update the `projects` data in `script.js` if you change project detail descriptions or technology tags. Replace placeholder repository/demo actions when published links are ready.
- Replace `profile.jpg` or `gg.jpg` with another image using the same filename, or update the corresponding `src` in `index.html`.
- Change the animated role phrases in the `roles` array in `script.js`.
- Update command palette destinations in the `.command-list` markup and `setupCommandPalette()` when adding new sections.

## Accessibility and motion

The page uses semantic sections and form labels, visible focus styles, keyboard-operable menus, career-map controls, cards, terminal, and dialogs, plus image alt text and a skip link. Reduced-motion preferences disable or simplify non-essential motion.

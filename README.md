## QueryForge - SQL Code Editor

QueryForge is a web-based SQL editor for running and displaying query results. Built with Vue 3, it features a CodeMirror-powered editor, table explorer, query history, and output display. It uses mock JSON data (`customer.json`, `employees.json`, etc.) and supports basic `SELECT` queries, designed for data analysts to manage SQL tasks efficiently.

## JavaScript Framework and Major Packages
- **Framework**: Vue 3 - For its reactivity and lightweight nature.
- **Build Tool**: Vite - For fast builds and HMR.
- **Editor**: CodeMirror 6 - With SQL syntax highlighting (`@codemirror/lang-sql`) and theming (`@uiw/codemirror-theme-okaidia`).
- **UI**: Material-UI - For icons (`@mui/icons-material`) and styling (`@mui/material`).
- **Utilities**:
  - Lodash - For throttling (`throttle`) to optimize `localStorage` writes.
  - Vue3-Virtual-Scroll-List - For potential virtual scrolling of large datasets.

## Page Load Time and Measurement
![image](https://github.com/user-attachments/assets/7cc1ca90-17dd-43da-b178-abc6c736056f)

Measured using Lighthouse on the deployed app:
- **Performance Score**: 99/100
- **Initial Load Time**: ~1.5s on a 4G connection (via Lighthouse’s network throttling).
- **CLS**: 99/100 - Minimal layout shifts.

## Optimizations
- **Vite Bundling**: Code-splitting and ES modules for faster loads.
- **Lazy Loading**: Dynamic imports for JSON data to reduce initial payload.
- **Throttling**: Lodash `throttle` for `localStorage` updates.
- **Efficient Rendering**: Vue reactivity and lightweight output table rendering.

## Large Dataset Handling
- Supports rendering 10,000+ rows using `vue3-virtual-scroll-list` (partially implemented).
- Data caching in memory to avoid re-processing.

## Deployment and Links
- **Deployed App**: [Insert link]
- **Docs**:
  - Sequence Diagram: [Insert link]
  - ER Diagram: [Insert link]
  - Explanation PDF: [Insert link]
  - Video Walkthrough: [Insert link]

## Notes
- **Accessibility**: Scored 78/100; future improvements include ARIA labels and keyboard navigation.
- **SEO**: Scored 50/100; will add meta tags and semantic HTML.
- **Challenges**:
  - Limited SQL parsing: Built a basic parser; plan to integrate `alasql`.
  - Large data rendering: Added virtual scrolling groundwork.

## QueryForge - SQL Code Editor

QueryForge is a lightweight, web-based SQL code editor built to provide a seamless and interactive environment for writing, executing, and managing SQL queries. Designed with a modern, dark-themed UI, it supports basic SELECT queries and includes features like query history, table exploration, and a responsive output display. The application uses mock JSON data (e.g., `customer.json`, `employees.json`, `product.json`, `supplier.json`) as its data source, making it ideal for educational purposes, prototyping, or small-scale SQL experimentation.

The project leverages Vue 3 as its JavaScript framework and is optimized for performance with tools like Vite, CodeMirror, and various UI enhancements.

## JavaScript Framework and Major Packages

- **Framework**: [Vue 3](https://vuejs.org/)  
  - Chosen for its reactivity, component-based architecture, and lightweight nature, making it perfect for a dynamic, single-page application like QueryForge.
- **Build Tool**: [Vite](https://vitejs.dev/)  
  - Provides fast development builds and optimized production bundles with hot module replacement (HMR).
- **Code Editor**: [CodeMirror 6](https://codemirror.net/)  
  - Powers the SQL editor with syntax highlighting (`@codemirror/lang-sql`), theming (`@uiw/codemirror-theme-okaidia`), and real-time updates.
- **UI Framework**: [Material-UI (MUI)](https://mui.com/)  
  - Used for icons (`@mui/icons-material`) and basic styling utilities (`@mui/material`), enhancing the UI with consistent, modern components.
- **Utilities**: 
  - [Lodash](https://lodash.com/) - For performance optimizations like throttling (`throttle`) to reduce unnecessary localStorage writes.
  - [Vue3-Virtual-Scroll-List](https://github.com/Akryum/vue-virtual-scroll-list) - Potential for virtual scrolling in large datasets (not fully implemented in the current version).

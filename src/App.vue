<template>
  <div class="app-container" :class="{ fullscreen: fullScreen }">
    <!-- Sidebar (Available Tables) on the left -->
    <div v-if="isTableSidebarVisible && !fullScreen" class="sidebar">
      <div class="sidebar-header">
        <h3>Available Tables</h3>
        <span class="toggle-arrow" @click="toggleTableSidebar">◄</span>
      </div>
      <TableInfo
        @select-table="handleSelectTable"
        @select-column="handleSelectColumn"
      />
    </div>
    <div v-else-if="!fullScreen" class="sidebar-toggle">
      <span class="toggle-arrow" @click="toggleTableSidebar">►</span>
    </div>

    <!-- Main Editor Section -->
    <div
      class="editor-container"
      :class="{
        'full-width': !isTableSidebarVisible || !isHistorySidebarVisible,
      }"
    >
      <!-- Editor Navbar -->
      <EditorNavbar
        :tabs="tabs"
        :active-tab="activeTab"
        :query="query"
        :full-screen="fullScreen"
        :is-output-visible="isOutputVisible"
        @update:tabs="tabs = $event"
        @update:active-tab="activeTab = $event"
        @update:query="query = $event"
        @update:full-screen="fullScreen = $event"
        @update:is-output-visible="isOutputVisible = $event"
        @submit="handleSubmit"
        @toggle-sidebars="toggleBothSidebars"
      />

      <!-- Editor and Output -->
      <div class="editor-content">
        <div class="editor-wrapper">
          <ShowEditor
            :query="query"
            :show-output-terminal="isOutputVisible"
            :full-screen="fullScreen"
            @update:query="query = $event"
          />
        </div>
        <div class="output-section">
          <div class="output-title" @click="toggleOutput">
            <h3>Output</h3>
            <!-- Performance Metrics -->
            <div v-if="outputData && outputData.length > 0" class="metrics">
              Query executed in {{ executionTime }} seconds, returned
              {{ outputData.length }} rows
            </div>
          </div>
          <div v-if="isOutputVisible" class="output-content">
            <ShowOutput
              :output-data="outputData"
              :is-output-load="isOutputLoad"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar (History) -->
    <div v-if="isHistorySidebarVisible && !fullScreen" class="right-sidebar">
      <div class="sidebar-header">
        <span class="toggle-arrow" @click="toggleHistorySidebar">►</span>
      </div>
      <History
        :history="history"
        @select-query="handleSelectQuery"
        @clear-history="handleClearHistory"
      />
    </div>
    <div v-else-if="!fullScreen" class="right-sidebar-toggle">
      <span class="toggle-arrow" @click="toggleHistorySidebar">◄</span>
    </div>
  </div>
</template>

<script>
import EditorNavbar from "./components/EditorNavbar.vue";
import ShowEditor from "./components/ShowEditor.vue";
import ShowOutput from "./components/ShowOutput.vue";
import History from "./components/History.vue";
import TableInfo from "./components/TableInfo.vue";
import { throttle } from "lodash"; 

export default {
  name: "App",
  components: {
    EditorNavbar,
    ShowEditor,
    ShowOutput,
    History,
    TableInfo,
  },
  data() {
    return {
      query: "SELECT * FROM Customer;",
      history: [],
      tabs: ["SELECT * FROM Customer;"],
      activeTab: 0,
      isOutputVisible: false,
      fullScreen: false,
      isTableSidebarVisible: true,
      isHistorySidebarVisible: true,
      outputData: null,
      isOutputLoad: false,
      executionTime: 0, 
      dataCache: {},
    };
  },
  created() {
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        this.history = parsedHistory.items || [];
      } catch (error) {
        console.error("Error parsing history from localStorage:", error);
        this.history = [];
      }
    }
    // Preload customer data to avoid initial load delay
    this.preloadData("customer");
  },
  mounted() {
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  methods: {
    handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue =
        "Are you sure you want to leave? Your query history will be saved, but other changes may be lost.";
    },
    async preloadData(tableName) {
      if (!this.dataCache[tableName]) {
        if (tableName === "customer") {
          const { default: data } = await import("./assets/data/customer.json");
          this.dataCache[tableName] = data;
        }
      }
    },
    async handleSubmit() {
      const start = performance.now(); // Start timing

      this.isOutputLoad = true;
      const query = this.query.trim().toLowerCase();
      if (!query.endsWith(";")) {
        this.outputData = [{ error: "Query must end with a semicolon." }];
        this.isOutputLoad = false;
        this.isOutputVisible = true;
        const end = performance.now();
        this.executionTime = ((end - start) / 1000).toFixed(3);
        return;
      }

      const selectMatch = query.match(/^select\s+(.+?)\s+from\s+(.+?);$/);
      if (!selectMatch) {
        this.outputData = [
          {
            error:
              "Only basic SELECT queries are supported (e.g., SELECT column FROM table;).",
          },
        ];
        this.isOutputLoad = false;
        this.isOutputVisible = true;
        const end = performance.now();
        this.executionTime = ((end - start) / 1000).toFixed(3);
        return;
      }

      const [, columnsPart, tableName] = selectMatch;
      const columns = columnsPart.split(",").map((col) => col.trim());
      const isSelectAll = columns[0] === "*";
      let rawData;

      // Check cache first
      if (this.dataCache[tableName]) {
        rawData = this.dataCache[tableName];
      } else {
        if (tableName === "customer") {
          const { default: data } = await import("./assets/data/customer.json");
          rawData = data;
        } else if (tableName === "employees") {
          const { default: data } = await import(
            "./assets/data/employees.json"
          );
          rawData = data;
        } else if (tableName === "product") {
          const { default: data } = await import("./assets/data/product.json");
          rawData = data;
        } else if (tableName === "supplier") {
          const { default: data } = await import("./assets/data/supplier.json");
          rawData = data;
        } else {
          this.outputData = [{ error: `Table "${tableName}" not found.` }];
          this.isOutputLoad = false;
          this.isOutputVisible = true;
          const end = performance.now();
          this.executionTime = ((end - start) / 1000).toFixed(3);
          return;
        }
        this.dataCache[tableName] = rawData;
      }

      if (isSelectAll) {
        this.outputData = rawData;
      } else {
        // Optimize column filtering
        const keyMap = {};
        const firstItem = rawData[0] || {};
        Object.keys(firstItem).forEach((key) => {
          keyMap[key.toLowerCase()] = key;
        });

        this.outputData = rawData.map((item) => {
          const filteredItem = {};
          columns.forEach((col) => {
            const dataKey = keyMap[col];
            if (dataKey) {
              filteredItem[dataKey] = item[dataKey];
            }
          });
          return filteredItem;
        });
      }

      this.isOutputLoad = false;
      this.history = [...this.history, this.query];
      this.saveHistory();
      this.isOutputVisible = true;

      const end = performance.now();
      this.executionTime = ((end - start) / 1000).toFixed(3); // Update execution time
    },
    saveHistory: throttle(function () {
      localStorage.setItem("history", JSON.stringify({ items: this.history }));
    }, 1000),
    toggleOutput() {
      this.isOutputVisible = !this.isOutputVisible;
    },
    handleSelectQuery(query) {
      this.query = query;
      this.tabs[this.activeTab] = query;
    },
    handleSelectTable(tableName) {
      const newQuery = `SELECT * FROM ${tableName};`;
      this.query = newQuery;
      this.tabs[this.activeTab] = newQuery;
    },
    handleSelectColumn({ tableName, columnName }) {
      const newQuery = `SELECT ${columnName} FROM ${tableName};`;
      this.query = newQuery;
      this.tabs[this.activeTab] = newQuery;
    },
    handleClearHistory() {
      this.history = [];
      this.saveHistory();
    },
    toggleTableSidebar() {
      this.isTableSidebarVisible = !this.isTableSidebarVisible;
    },
    toggleHistorySidebar() {
      this.isHistorySidebarVisible = !this.isHistorySidebarVisible;
    },
    toggleBothSidebars() {
      this.isTableSidebarVisible = !this.isTableSidebarVisible;
      this.isHistorySidebarVisible = !this.isHistorySidebarVisible;
    },
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #0d1116;
  color: white;
}

.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
}

.fullscreen .editor-container {
  flex: 1;
  border: none;
}

.sidebar {
  flex: 0.2;
  border-right: 1px solid #ffffff33;
  padding: 1rem;
  overflow-y: auto;
  scrollbar-width: thin;
}

.sidebar-toggle {
  flex: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ffffff33;
  background-color: #0d1116;
  cursor: pointer;
}

.right-sidebar {
  flex: 0.2;
  border-left: 1px solid #ffffff33;
  padding: 1rem;
  overflow-y: auto;
}

.right-sidebar-toggle {
  flex: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #ffffff33;
  background-color: #0d1116;
  cursor: pointer;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: hsl(0, 0%, 99%);
}

.toggle-arrow {
  font-size: 1.2rem;
  color: #d1d5db;
  cursor: pointer;
}

.toggle-arrow:hover {
  color: #fff;
}

.editor-container {
  flex: 0.6;
  border-left: 1px solid #ffffff33;
  border-right: 1px solid #ffffff33;
  display: flex;
  flex-direction: column;
  overflow: auto;
  transition: flex 0.3s ease;
}

.editor-container.full-width {
  flex: 1;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-wrapper {
  flex: 1;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.output-section {
  border-top: 1px solid #ffffff33;
  overflow: hidden;
}

.output-title {
  margin: 0;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  background-color: #0d1116;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

.output-title:hover {
  background-color: #2c313a;
}

.output-content {
  height: 250px;
  overflow: hidden;
}

.metrics {
  padding: 0.5rem 1rem;
  color: #60a5fa;
  font-size: 0.875rem;
}
</style>

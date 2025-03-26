<template>
  <div class="app-container" :class="{ fullscreen: fullScreen }">
    <!-- Sidebar (Available Tables) on the left -->
    <div v-if="isTableSidebarVisible && !fullScreen" class="sidebar">
      <div class="sidebar-header">
        <h3>Available Tables</h3>
        <span class="toggle-arrow" @click="toggleTableSidebar">◄</span>
      </div>
      <TableInfo @select-table="handleSelectTable" @select-column="handleSelectColumn" />
    </div>
    <div v-else-if="!fullScreen" class="sidebar-toggle">
      <span class="toggle-arrow" @click="toggleTableSidebar">►</span>
    </div>

    <!-- Main Editor Section -->
    <div class="editor-container" :class="{ 'full-width': !isTableSidebarVisible || !isHistorySidebarVisible }">
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
          <h3 class="output-title" @click="toggleOutput">Output</h3>
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
      <History :history="history" @select-query="handleSelectQuery" @clear-history="handleClearHistory" />
    </div>
    <div v-else-if="!fullScreen" class="right-sidebar-toggle">
      <span class="toggle-arrow" @click="toggleHistorySidebar">◄</span>
    </div>
  </div>
</template>

<script>
import EditorNavbar from './components/EditorNavbar.vue'
import ShowEditor from './components/ShowEditor.vue'
import ShowOutput from './components/ShowOutput.vue'
import History from './components/History.vue'
import TableInfo from './components/TableInfo.vue'

export default {
  name: 'App',
  components: {
    EditorNavbar,
    ShowEditor,
    ShowOutput,
    History,
    TableInfo,
  },
  data() {
    return {
      query: 'SELECT * FROM Customer;',
      history: [],
      tabs: ['SELECT * FROM Customer;'],
      activeTab: 0,
      isOutputVisible: false,
      fullScreen: false,
      isTableSidebarVisible: true,
      isHistorySidebarVisible: true,
      outputData: null,
      isOutputLoad: false,
    }
  },
  created() {
    const savedHistory = localStorage.getItem('history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        this.history = parsedHistory.items || []
      } catch (error) {
        console.error('Error parsing history from localStorage:', error)
        this.history = []
      }
    }
  },
  mounted() {
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  beforeUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  methods: {
    handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave? Your query history will be saved, but other changes may be lost.'
    },
    async handleSubmit() {
      this.isOutputLoad = true
      const query = this.query.trim().toLowerCase()
      if (!query.endsWith(';')) {
        this.outputData = [{ error: 'Query must end with a semicolon.' }]
        this.isOutputLoad = false
        this.isOutputVisible = true // Open output window even on error
        return
      }
      const selectMatch = query.match(/^select\s+(.+?)\s+from\s+(.+?);$/)
      if (!selectMatch) {
        this.outputData = [{ error: 'Only basic SELECT queries are supported (e.g., SELECT column FROM table;).' }]
        this.isOutputLoad = false
        this.isOutputVisible = true // Open output window even on error
        return
      }
      const [, columnsPart, tableName] = selectMatch
      const columns = columnsPart.split(',').map(col => col.trim())
      const isSelectAll = columns[0] === '*'
      let rawData
      if (tableName === 'customer') {
        const { default: data } = await import('./assets/data/customer.json')
        rawData = data
      } else if (tableName === 'employees') {
        const { default: data } = await import('./assets/data/employees.json')
        rawData = data
      }else if (tableName === 'product') {
        const { default: data } = await import('./assets/data/product.json')
        rawData = data
      } else if (tableName === 'supplier') {
        const { default: data } = await import('./assets/data/supplier.json')
        rawData = data
      } else {
        this.outputData = [{ error: `Table "${tableName}" not found.` }]
        this.isOutputLoad = false
        this.isOutputVisible = true // Open output window even on error
        return
      }
      if (isSelectAll) {
        this.outputData = rawData
      } else {
        this.outputData = rawData.map(item => {
          const filteredItem = {}
          columns.forEach(col => {
            const dataKey = Object.keys(item).find(key => key.toLowerCase() === col)
            if (dataKey) {
              filteredItem[dataKey] = item[dataKey]
            }
          })
          return filteredItem
        })
      }
      this.isOutputLoad = false
      this.history = [...this.history, this.query]
      localStorage.setItem('history', JSON.stringify({ items: this.history }))
      this.isOutputVisible = true // Open output window on successful query
    },
    toggleOutput() {
      this.isOutputVisible = !this.isOutputVisible
    },
    handleSelectQuery(query) {
      this.query = query
      this.tabs[this.activeTab] = query
    },
    handleSelectTable(tableName) {
      const newQuery = `SELECT * FROM ${tableName};`
      this.query = newQuery
      this.tabs[this.activeTab] = newQuery
    },
    handleSelectColumn({ tableName, columnName }) {
      const newQuery = `SELECT ${columnName} FROM ${tableName};`
      this.query = newQuery
      this.tabs[this.activeTab] = newQuery
    },
    handleClearHistory() {
      this.history = []
      localStorage.setItem('history', JSON.stringify({ items: this.history }))
    },
    toggleTableSidebar() {
      this.isTableSidebarVisible = !this.isTableSidebarVisible
    },
    toggleHistorySidebar() {
      this.isHistorySidebarVisible = !this.isHistorySidebarVisible
    },
    toggleBothSidebars() {
      this.isTableSidebarVisible = !this.isTableSidebarVisible
      this.isHistorySidebarVisible = !this.isHistorySidebarVisible
    },
  },
}
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
  border: none; /* Remove borders in fullscreen mode */
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
  background-color: #1a1e24;
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
  background-color: #1a1e24;
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
  background-color: #0D1116;
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
</style>
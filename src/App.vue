<template>
  <div class="app-container">
    <!-- Sidebar (Available Tables) on the left -->
    <div v-if="isTableSidebarVisible" class="sidebar">
      <div class="sidebar-header">
        <h3>Available Tables</h3>
        <span class="toggle-arrow" @click="toggleTableSidebar">◄</span>
      </div>
      <TableInfo @select-table="handleSelectTable" @select-column="handleSelectColumn" />
    </div>
    <div v-else class="sidebar-toggle">
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
        <!-- Always show the Output title, but toggle the content -->
        <div class="output-section">
          <h3 class="output-title" @click="toggleOutput" >Output</h3>
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
    <div v-if="isHistorySidebarVisible" class="right-sidebar">
      <div class="sidebar-header">
    
        <span class="toggle-arrow" @click="toggleHistorySidebar">►</span>
      </div>
      <History :history="history" @select-query="handleSelectQuery" @clear-history="handleClearHistory" />
    </div>
    <div v-else class="right-sidebar-toggle">
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
    // Load history from localStorage on app start
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
    // Add event listener to prevent page reload
    window.addEventListener('beforeunload', this.handleBeforeUnload)
  },
  beforeUnmount() {
    // Clean up event listener
    window.removeEventListener('beforeunload', this.handleBeforeUnload)
  },
  methods: {
    handleBeforeUnload(event) {
      // Show a confirmation dialog when the user tries to reload the page
      event.preventDefault()
      event.returnValue = 'Are you sure you want to leave? Your query history will be saved, but other changes may be lost.'
    },
    async handleSubmit() {
      this.isOutputLoad = true

      // Parse the query to extract columns and table
      const query = this.query.trim().toLowerCase()
      if (!query.endsWith(';')) {
        this.outputData = [{ error: 'Query must end with a semicolon.' }]
        this.isOutputLoad = false
        return
      }

      // Basic parsing for SELECT queries
      const selectMatch = query.match(/^select\s+(.+?)\s+from\s+(.+?);$/)
      if (!selectMatch) {
        this.outputData = [{ error: 'Only basic SELECT queries are supported (e.g., SELECT column FROM table;).' }]
        this.isOutputLoad = false
        return
      }

      const [, columnsPart, tableName] = selectMatch
      const columns = columnsPart.split(',').map(col => col.trim())
      const isSelectAll = columns[0] === '*'

      // Load the appropriate data file based on the table name
      let rawData
      if (tableName === 'customer') {
        const { default: data } = await import('./assets/data/customer.json')
        rawData = data
      } else if (tableName === 'product') {
        const { default: data } = await import('./assets/data/product.json')
        rawData = data
      } else if (tableName === 'supplier') {
        const { default: data } = await import('./assets/data/supplier.json')
        rawData = data
      } else {
        this.outputData = [{ error: `Table "${tableName}" not found.` }]
        this.isOutputLoad = false
        return
      }

      // Filter the data based on the selected columns
      if (isSelectAll) {
        this.outputData = rawData
      } else {
        this.outputData = rawData.map(item => {
          const filteredItem = {}
          columns.forEach(col => {
            // Map the column name to the data key (case-insensitive)
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

.sidebar {
  flex: 0.2;
  border-right: 1px solid #ffffff33;
  padding: 1rem;
  overflow-y: auto;
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
  overflow: hidden; /* Prevent the entire output section from scrolling */
}

.output-title {
  margin: 0;
  padding: 0.5rem 1rem;
  background-color: #0D1116; /* Darker background to match the screenshot */
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

.output-title:hover {
  background-color: #2c313a; /* Hover effect to match the screenshot */
}

.output-content {
  height: 250px; /* Fixed height for the output section */
  overflow: hidden; /* Prevent the container from scrolling */
}
</style>
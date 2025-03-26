<template>
  <div class="app-container">
    <!-- Sidebar (Available Tables) on the left -->
    <div class="sidebar">
      <TableInfo @select-table="handleSelectTable" @select-column="handleSelectColumn" />
    </div>

    <!-- Main Editor Section -->
    <div class="editor-container">
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
        <ShowEditor
          :query="query"
          :show-output-terminal="isOutputVisible"
          :full-screen="fullScreen"
          @update:query="query = $event"
        />
        <div class="output" v-if="isOutputVisible">
          <h3 class="output-title" @click="toggleOutput">Output</h3>
          <ShowOutput
            :output-data="outputData"
            :is-output-load="isOutputLoad"
          />
        </div>
      </div>
    </div>

    <!-- Right Sidebar (History) -->
    <div class="right-sidebar">
      <!-- History -->
      <div class="table-info">
        <History :history="history" @select-query="handleSelectQuery" @clear-history="handleClearHistory" />
      </div>
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
      hideSideBar: true,
      hideTableSideBar: false,
      outputData: null,
      isOutputLoad: false,
    }
  },
  methods: {
    async handleSubmit() {
      this.isOutputVisible = true
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
  padding: 10px;
  overflow-y: auto;
}

.editor-container {
  flex: 0.6;
  border-left: 1px solid #ffffff33;
  border-right: 1px solid #ffffff33;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-sidebar {
  flex: 0.2;
  border-left: 1px solid #ffffff33;
}

.table-info {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.output {
  height: 240px;
  border-top: 1px solid #ffffff33;
}

.output-title {
  margin: 0;
  padding: 0.5rem 1rem;
  background-color: #0d1116;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

.output-title:hover {
  background-color: #2c313a;
}
</style>
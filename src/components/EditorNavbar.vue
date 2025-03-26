<template>
  <div class="editor-navbar">
    <!-- Tabs Section -->
    <div class="tabs-container">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab', { active: activeTab === index }]"
        @click="handleActiveTab(index)"
      >
        <span class="tab-label">Console {{ index }}</span>
        <span
          v-if="index !== 0"
          class="close-tab"
          @click.stop="handleRemoveTab(index)"
        >
          x
        </span>
      </div>
      <button class="add-tab-btn" @click="handleAddTab">+</button>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <!-- File Import -->
      <label for="file-input" class="action-btn import-btn">
        Import
        <UploadFileIcon class="icon" />
      </label>
      <input
        id="file-input"
        type="file"
        class="hidden"
        @change="handleFileImport"
      />

      <!-- File Export -->
      <button class="action-btn export-btn" @click="handleExport">
        Export
        <DownloadIcon class="icon" />
      </button>

      <!-- Run SQL Button -->
      <button
        class="action-btn run-btn"
        :disabled="!query"
        @click="handleSubmit"
      >
        Run SQL
      </button>
    </div>
  </div>
</template>

<script>
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'

export default {
  name: 'EditorNavbar',
  components: {
    UploadFileIcon,
    DownloadIcon,
  },
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: Number,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    fullScreen: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'update:tabs',
    'update:activeTab',
    'update:query',
    'update:fullScreen',
    'submit',
  ],
  data() {
    return {
      darkMode: true, // Default to dark mode (can be toggled)
    }
  },
  methods: {
    handleActiveTab(index) {
      const updatedTabs = [...this.tabs]
      updatedTabs[this.activeTab] = this.query
      this.$emit('update:tabs', updatedTabs)
      this.$emit('update:query', updatedTabs[index])
      this.$emit('update:activeTab', index)
    },
    handleAddTab() {
      const updatedTabs = [...this.tabs, '']
      this.$emit('update:tabs', updatedTabs)
      this.$emit('update:query', '')
      this.$emit('update:activeTab', updatedTabs.length - 1)
    },
    handleRemoveTab(index) {
      const updatedTabs = this.tabs.filter((_, i) => i !== index)
      const newActiveTab =
        updatedTabs.length - 1 >= this.activeTab
          ? this.activeTab
          : updatedTabs.length - 1
      this.$emit('update:tabs', updatedTabs)
      this.$emit('update:query', updatedTabs[newActiveTab] || '')
      this.$emit('update:activeTab', newActiveTab)
    },
    handleFileImport(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          this.$emit('update:query', content)
        }
        reader.readAsText(file)
      }
    },
    handleExport() {
      const blob = new Blob([this.query], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'query.sql'
      a.click()
      window.URL.revokeObjectURL(url)
    },
    handleSubmit() {
      this.$emit('submit')
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      // Emit an event or handle dark mode toggle logic if needed
    },
  },
}
</script>

<style scoped>
.editor-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  background-color: #0d1116;
}

.tabs-container {
  display: flex;
  align-items: center;
  overflow-x: auto;
  height: 100%;
  scrollbar-width: none;
}

.tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  height: 100%;
  min-width: 120px;
  background-color: #1a1e24;
  border-right: 1px solid #ffffff33;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tab.active {
  background-color: #282c34;
}

.tab-label {
  font-size: 0.9rem;
  color: #d1d5db;
}

.tab-label:hover {
  text-decoration: underline;
}

.close-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 0.5rem;
  background-color: #4b5563;
  color: #d1d5db;
  border-radius: 50%;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-tab:hover {
  background-color: #ef4444;
  color: white;
}

.add-tab-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  background-color: #4b5563;
  color: #d1d5db;
  border: none;
  border-radius: 5px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-tab-btn:hover {
  background-color: #6b7280;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: #4b5563;
  color: #d1d5db;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: #6b7280;
}

.import-btn,
.export-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 55px;
  height: 30px;
  background-color: #4b5563;
  color: #d1d5db;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
}

.import-btn:hover,
.export-btn:hover {
  background-color: #6b7280;
}

.run-btn {
  width: auto;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  margin: 4px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
}

.run-btn:hover {
  background-color: #2563eb;
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hidden {
  display: none;
}

/* Add styling for icons to ensure visibility */
.icon {
  margin-left: 0.25rem;
  font-size: 1rem;
  color: white;
}
</style>
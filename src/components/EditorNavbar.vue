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
        <span class="tab-label">Input {{ index }}</span>
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
      <!-- Fullscreen Toggle Button -->
      <button class="action-btn sidebar-toggle-btn" @click="handleToggleFullScreen">
        <svg v-if="!fullScreen" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      </button>

      <!-- Import Button -->
      <label for="file-input" class="action-btn import-btn">
        <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
          <g><rect fill="none" height="24" width="24"/></g>
          <g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M7,9l1.41,1.41L11,7.83V16h2V7.83l2.59,2.58L17,9l-5-5L7,9z"/></g>
        </svg>
      </label>
      <input
        id="file-input"
        type="file"
        class="hidden"
        @change="handleFileImport"
      />

      <!-- Export Button -->
      <button class="action-btn export-btn" @click="handleExport">
        <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
          <g><rect fill="none" height="24" width="24"/></g>
          <g><path d="M18,15v3H6v-3H4v3c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2v-3H18z M17,11l-1.41-1.41L13,12.17V4h-2v8.17L8.41,9.59L7,11l5,5L17,11z"/></g>
        </svg>
      </button>

      <!-- Run SQL Button -->
      <button
        class="action-btn run-btn"
        :disabled="!query"
        @click="handleSubmit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
          <path d="M0 0h24v24H0V0z" fill="none"/>
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import DownloadIcon from '@mui/icons-material/Download';

export default {
  name: 'EditorNavbar',
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
    'toggle-sidebars',
  ],
  data() {
    return {
      darkMode: true,
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
    handleToggleSidebars() {
      this.$emit('toggle-sidebars')
    },
    handleToggleFullScreen() {
      console.log('Toggling fullscreen, current state:', this.fullScreen) // Debug log
      this.$emit('update:fullScreen', !this.fullScreen)
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

.sidebar-toggle-btn {
  margin-left: 0.5rem;
  background-color: #4b5563;
  color: #d1d5db;
  border: none;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-toggle-btn:hover {
  background-color: #6b7280;
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
  justify-content: space-evenly;
  height: 80%;
  padding: 5px;
  min-width: 120px;
  background-color: #0D1116;
  border-right: 1px solid #ffffff33;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tab.active {
  background-color: #1C2130;
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

.icon {
  margin-left: 0.25rem;
  font-size: 1rem;
  color: white;
}
</style>
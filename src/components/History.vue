<template>
  <div class="history-container">
    <div class="history-header">
      
      <h3>Recent</h3>
      <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">
        Clear Queries
      </button>
    </div>
    <div v-if="history.length === 0" class="no-history">
      No query history available.
    </div>
    <div
      v-else
      v-for="(query, index) in history"
      :key="index"
      class="history-item"
      @click="selectQuery(query)"
    >
      {{ query }}
    </div>
  </div>
</template>

<script>
export default {
  name: "History",
  props: {
    history: {
      type: Array,
      required: true,
    },
  },
  methods: {
    selectQuery(query) {
      this.$emit("select-query", query);
    },
    clearHistory() {
      this.$emit("clear-history");
    },
  },
};
</script>

<style scoped>
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: background-color 0.2s ease;
}

.clear-btn:hover {
  background-color: #dc2626;
}

.no-history {
  color: #d1d5db;
  font-style: italic;
  text-align: center;
}

.history-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #1a1e24;
  border-radius: 5px;
  font-size: medium;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-item:hover {
  background-color: #2c313a;
}
</style>

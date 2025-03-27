<template>
  <div class="history-container">
    <div class="history-header">
      
      <h3>Recent Queries</h3>
      <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">
       <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/></svg>
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
  color:red;
  background-color: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  padding: 4px;
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

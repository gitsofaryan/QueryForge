<template>
  <div class="output-wrapper">
    <!-- Output Content -->
    <div v-if="isOutputLoad" class="loading">Loading...</div>
    <div
      v-else-if="outputData && outputData.length > 0"
      class="table-container"
    >
      <table>
        <thead>
          <tr>
            <th v-for="(key, index) in Object.keys(outputData[0])" :key="index">
              {{ key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in outputData" :key="rowIndex">
            <td v-for="(value, colIndex) in Object.values(row)" :key="colIndex">
              {{ value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="no-data">No data to display</div>
  </div>
</template>

<script>
export default {
  name: "ShowOutput",
  props: {
    outputData: {
      type: Array,
      default: () => [],
    },
    isOutputLoad: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.output-wrapper {
  width: 100%;
  height: 100%; /* Fit within the parent container */
  background-color: #1e2227;
  color: white;
  overflow: hidden; /* Prevent the wrapper from scrolling */
}

.loading {
  padding: 1rem;
  text-align: center;
  color: #d1d5db;
}

.table-container {
  width: 100%;
  height: 100%;
  overflow: auto; /* Enable scrolling for the table */
  scrollbar-width: thin;
  padding: 0; /* Remove padding to match the screenshot */
}

/* For Webkit browsers (Chrome, Edge, Safari) */
.table-container::-webkit-scrollbar {
  width: 6px; /* Vertical scrollbar */
  height: 6px; /* Horizontal scrollbar */
}

.table-container::-webkit-scrollbar-track {
  background: #1e2227;
}

.table-container::-webkit-scrollbar-thumb {
  background: #2c313a;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #3e4451;
}

table {
  width: 100%; /* Take up the full width of the container */
  border-collapse: collapse;
  font-size: 0.875rem; /* Smaller font size to match the screenshot */
}

th,
td {
  padding: 0.5rem; /* Consistent padding as in the screenshot */
  border-bottom: 1px solid #ffffff33; /* Border only on the bottom */
  text-align: left;
  white-space: nowrap; /* Prevent text wrapping */
}

th {
  background-color: #2c313a; /* Darker background for headers */
  color: #fff;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

td {
  background-color: #1e2227;
  color: #d1d5db; /* Lighter text color for cells */
  font-weight: normal;
}

.no-data {
  padding: 1rem;
  text-align: center;
  color: #d1d5db;
}
</style>
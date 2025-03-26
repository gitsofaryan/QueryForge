<template>
  <div class="table-info-container">
          <h3>Available Tables</h3>
    <div v-for="(table, index) in tables" :key="index" class="table-item">
        
      <div class="table-header" @click="toggleTable(index)">
        <span class="table-name" @click.stop="selectTable(table.name)">{{ table.name }}</span>
        <span class="toggle-icon">{{ expanded[index] ? '▼' : '▶' }}</span>
      </div>
      <div v-if="expanded[index]" class="table-columns">
        <div
          v-for="(column, colIndex) in table.columns"
          :key="colIndex"
          class="column-item"
          @click="selectColumn(table.name, column.name)"
        >
          <span class="column-indent">↳</span>
          <span class="column-name">{{ column.name }}</span>
          <span class="column-type">[{{ column.type }}]</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableInfo',
  data() {
    return {
      tables: [
        {
          name: 'Customer',
          columns: [
            { name: 'customerID', type: 'varchar' },
            { name: 'companyName', type: 'varchar' },
            { name: 'contactName', type: 'varchar' },
            { name: 'contactTitle', type: 'varchar' },
            { name: 'address', type: 'varchar' },
            { name: 'city', type: 'varchar' },
            { name: 'region', type: 'varchar' },
            { name: 'postalCode', type: 'varchar' },
            { name: 'country', type: 'varchar' },
            { name: 'phone', type: 'varchar' },
            { name: 'fax', type: 'varchar' },
          ],
        },
        {
          name: 'Product',
          columns: [
            { name: 'productID', type: 'int' },
            { name: 'productName', type: 'varchar' },
            { name: 'supplierID', type: 'int' },
            { name: 'categoryID', type: 'int' },
            { name: 'quantityPerUnit', type: 'varchar' },
            { name: 'unitPrice', type: 'decimal' },
            { name: 'unitsInStock', type: 'int' },
            { name: 'unitsOnOrder', type: 'int' },
            { name: 'reorderLevel', type: 'int' },
            { name: 'discontinued', type: 'int' },
          ],
        },
        {
          name: 'Supplier',
          columns: [
            { name: 'shipperID', type: 'int' },
            { name: 'companyName', type: 'varchar' },
            { name: 'phone', type: 'varchar' },
          ],
        },
      ],
      expanded: [],
    }
  },
  created() {
    this.expanded = this.tables.map(() => false)
  },
  methods: {
    toggleTable(index) {
      this.expanded[index] = !this.expanded[index]
      this.$forceUpdate()
    },
    selectTable(tableName) {
      this.$emit('select-table', tableName)
    },
    selectColumn(tableName, columnName) {
      this.$emit('select-column', { tableName, columnName })
    },
  },
}
</script>

<style scoped>


.table-info-container {
  margin-top: 1rem;
}

.table-item {
  margin-bottom: 1rem;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #1a1e24;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.table-header:hover {
  background-color: #2c313a;
}

.table-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
  color: #d1d5db;
}

.table-name {
  flex: 1;
  cursor: pointer;
}

.table-name:hover {
  text-decoration: underline;
}

.toggle-icon {
  font-size: 0.8rem;
  color: #d1d5db;
}

.table-columns {
  padding: 0.5rem 1rem;
  background-color: #1e2227;
  border-radius: 5px;
  margin-top: 0.25rem;
}

.column-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
  color: #d1d5db;
  font-size: 0.9rem;
  cursor: pointer;
}

.column-item:hover {
  background-color: #2c313a;
  border-radius: 3px;
}

.column-indent {
  margin-right: 0.5rem;
  color: #d1d5db;
}

.column-name {
  flex: 1;
}

.column-type {
  color: #60a5fa;
}
</style>
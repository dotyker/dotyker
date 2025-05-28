<template>
  <q-page class="page-background q-pa-md">
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-regular text-grey-8 q-ma-none">
          {{ getPageTitle() }}
        </h1>
        <p class="text-grey-6 q-mt-sm q-mb-none">
          {{ getPageSubtitle() }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="row q-gutter-sm">
        <q-btn
          outline
          no-caps
          color="grey-7"
          icon="sym_o_download"
          label="Export"
          class="text-weight-medium"
          @click="handleExport"
        />
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="sym_o_add"
          label="New Item"
          class="text-weight-medium"
          @click="handleNewItem"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat class="card-elevated q-pa-md">
          <div class="row items-center">
            <div class="col">
              <div class="text-grey-6 text-caption text-uppercase">
                {{ stat.label }}
              </div>
              <div class="text-h5 text-weight-bold text-grey-8 q-mt-xs">
                {{ stat.value }}
              </div>
              <div
                class="text-caption q-mt-xs"
                :class="stat.trend > 0 ? 'text-positive' : 'text-negative'"
              >
                <q-icon
                  :name="stat.trend > 0 ? 'sym_o_trending_up' : 'sym_o_trending_down'"
                  size="16px"
                />
                {{ Math.abs(stat.trend) }}% from last month
              </div>
            </div>
            <q-icon :name="stat.icon" size="40px" class="text-grey-4" />
          </div>
        </q-card>
      </div>
    </div>

    <!-- Data Table -->
    <q-card flat class="card-elevated">
      <q-card-section class="q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-weight-medium text-grey-8">Recent Activity</div>
          <q-input
            v-model="searchText"
            outlined
            dense
            placeholder="Search..."
            class="q-ml-md"
            style="min-width: 200px"
          >
            <template #prepend>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
        </div>

        <q-table
          :rows="filteredTableData"
          :columns="tableColumns"
          row-key="id"
          flat
          :pagination="{ rowsPerPage: 10 }"
          class="modern-table"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.value)"
                :label="props.value"
                class="text-capitalize"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_visibility"
                  size="sm"
                  @click="handleView(props.row)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  size="sm"
                  @click="handleEdit(props.row)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  size="sm"
                  color="negative"
                  @click="handleDelete(props.row)"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Types
interface Stat {
  label: string
  value: string
  trend: number
  icon: string
}

interface TableRow {
  id: number
  name: string
  email: string
  status: 'active' | 'pending' | 'inactive'
  created: string
}

interface TableColumn {
  name: string
  label: string
  field: string | ((row: TableRow) => unknown)
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
}

// Reactive state
const activeTab = ref<string>('dashboard')
const searchText = ref<string>('')

// Static data
const stats = ref<Stat[]>([
  {
    label: 'Total Users',
    value: '2,543',
    trend: 12.5,
    icon: 'sym_o_group',
  },
  {
    label: 'Revenue',
    value: '$45,210',
    trend: 8.2,
    icon: 'sym_o_payments',
  },
  {
    label: 'Orders',
    value: '1,247',
    trend: -3.1,
    icon: 'sym_o_shopping_cart',
  },
  {
    label: 'Conversion',
    value: '3.2%',
    trend: 15.3,
    icon: 'sym_o_trending_up',
  },
])

const tableColumns: TableColumn[] = [
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'created',
    label: 'Created',
    field: 'created',
    align: 'left',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
  },
]

const tableData = ref<TableRow[]>([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    status: 'active',
    created: '2024-01-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    status: 'pending',
    created: '2024-01-14',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    status: 'active',
    created: '2024-01-13',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    status: 'inactive',
    created: '2024-01-12',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    status: 'active',
    created: '2024-01-11',
  },
])

// Computed properties
const filteredTableData = computed(() => {
  if (!searchText.value) {
    return tableData.value
  }

  const search = searchText.value.toLowerCase()
  return tableData.value.filter(
    (row) =>
      row.name.toLowerCase().includes(search) ||
      row.email.toLowerCase().includes(search) ||
      row.status.toLowerCase().includes(search),
  )
})

const getPageTitle = (): string => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    reports: 'Reports',
  }
  return titles[activeTab.value] || 'Dashboard'
}

const getPageSubtitle = (): string => {
  const subtitles: Record<string, string> = {
    dashboard: 'Overview of your business metrics and recent activity',
    analytics: 'Detailed insights and performance analysis',
    reports: 'Generate and view comprehensive reports',
  }
  return subtitles[activeTab.value] || 'Welcome to your dashboard'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'positive',
    pending: 'warning',
    inactive: 'grey',
  }
  return colors[status] || 'grey'
}

const handleExport = (): void => {
  console.log('Export functionality')
}

const handleNewItem = (): void => {
  console.log('New item functionality')
}

const handleView = (row: TableRow): void => {
  console.log('View:', row)
}

const handleEdit = (row: TableRow): void => {
  console.log('Edit:', row)
}

const handleDelete = (row: TableRow): void => {
  console.log('Delete:', row)
}
</script>

<style scoped>
/* Header gradient for depth */
.header-gradient {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

/* Page background with subtle gradient */
.page-background {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  min-height: 100vh;
}

/* Enhanced card styling */
.card-elevated {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-elevated:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.07),
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transform: translateY(-1px);
}

/* Modern table styling */
.modern-table {
  box-shadow: none;
  background: transparent;
}

.modern-table :deep(.q-table__top) {
  padding: 0;
  background: transparent;
}

.modern-table :deep(.q-table__bottom) {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(248, 250, 252, 0.6);
  backdrop-filter: blur(10px);
}

.modern-table :deep(.q-table__container) {
  background: transparent;
}

.modern-table :deep(th) {
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  color: #475569;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
}

.modern-table :deep(td) {
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(5px);
}

.modern-table :deep(tr:hover td) {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
}

.modern-table :deep(.q-table tbody tr:nth-child(even) td) {
  background: rgba(248, 250, 252, 0.3);
}

.modern-table :deep(.q-table tbody tr:nth-child(even):hover td) {
  background: rgba(255, 255, 255, 0.7);
}

/* Enhanced mobile drawer */
.q-drawer :deep(.q-drawer__content) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
}
</style>

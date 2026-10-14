import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('../views/HomeView.vue')
const InventoryView = () => import('../views/InventoryView.vue')
const AddProductView = () => import('../views/AddProductView.vue')
const EditProductView = () => import('../views/EditProductView.vue')
const StockView = () => import('../views/StockView.vue')
const ReportsView = () => import('../views/ReportsView.vue')
const NotFoundView = () => import('../views/NotFoundView.vue')

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/inventory', name: 'inventory', component: InventoryView },
  { path: '/add-product', name: 'add-product', component: AddProductView },
  { path: '/edit-product/:id', name: 'edit-product', component: EditProductView },
  { path: '/stock', name: 'stock', component: StockView },
  { path: '/reports', name: 'reports', component: ReportsView },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

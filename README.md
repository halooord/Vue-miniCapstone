# Poultry Shop Inventory Management System

A Vue 3 + Vite single-page application for managing poultry inventory, stock adjustments, and product CRUD operations.

## Features

- Dashboard overview with total products, total stock, low-stock alerts, and inventory value
- Inventory table with search and category/status filtering
- Add and edit product forms with validation
- CRUD support for product records
- Stock in/out management with movement history
- Inventory reports page with category summary and low-stock list
- Persistent browser storage using localStorage
- Responsive layout for school presentation and demonstration

## Run locally

1. Open a terminal in the project folder.
2. Install dependencies:
   npm install
3. Start the development server:
   npm run dev -- --host 0.0.0.0
4. Visit http://localhost:5173/

## Build for production

npm run build

## Data storage

This app stores inventory and stock history in the browser's localStorage, so the data is saved on the current device and is not synchronized across users or devices.

## Vue.js concepts demonstrated

- Vue Router: navigation between Dashboard, Inventory, Add Product, Stock, Reports, and Not Found pages
- Vue 3 Composition API: use of script setup, ref(), computed(), and reactive state handling
- Reusable components: AppNavbar, SummaryCard, ProductForm, ProductTable, StockAdjustmentForm
- v-model: managing form fields for add/edit and stock adjustments
- v-for: rendering product lists and stock history rows
- v-if / v-else: conditional empty states, validation feedback, and not-found handling
- :bind and @ event handling: dynamic routing, button actions, form submission, and updates
- localStorage: saving and loading inventory data with persistence after refresh
- CRUD operations: create, read, update, and delete inventory records
- Computed properties: dashboard totals, reports summaries, and filter results

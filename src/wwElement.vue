<template>
  <!-- Backdrop -->
  <teleport to="body">
    <div
      v-if="isOpen"
      :class="getBackdropClasses()"
      @click="handleBackdropClick"
    />
    
    <!-- Drawer container -->
    <div
      v-if="isOpen"
      :class="getDrawerClasses()"
      :style="customStyle"
      role="dialog"
      :aria-labelledby="title ? 'drawer-title' : undefined"
      :aria-describedby="description ? 'drawer-description' : undefined"
      @keydown="handleKeyDown"
      tabindex="-1"
    >
      <!-- Drag handle -->
      <div 
        v-if="showHandle !== false && (direction === 'bottom' || direction === 'top' || !direction)"
        class="drawer-handle"
        @mousedown="handleDragStart"
        @touchstart="handleDragStart"
      />

      <!-- Header -->
      <div 
        v-if="showHeader !== false"
        :class="getHeaderClasses()"
      >
        <div class="drawer-header-content">
          <div class="drawer-header-text">
            <h2
              v-if="title"
              id="drawer-title"
              class="drawer-title"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              id="drawer-description"
              class="drawer-description"
            >
              {{ description }}
            </p>
          </div>
          
          <!-- Close button -->
          <button
            v-if="showClose !== false"
            @click="closeDrawer"
            class="drawer-close-button"
            :aria-label="closeLabel || 'Close'"
          >
            <svg class="drawer-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div 
        :class="getContentClasses()"
      >
        <!-- Custom content -->
        <div v-if="content" v-html="content" />
        
        <!-- Quick actions -->
        <div v-if="quickActions && quickActions.length > 0" class="drawer-quick-actions">
          <div class="drawer-quick-actions-grid">
            <button
              v-for="(action, index) in quickActions"
              :key="action.id || index"
              @click="handleQuickAction(action)"
              :disabled="action.disabled"
              :class="getQuickActionClasses(action)"
            >
              <component
                v-if="action.icon"
                :is="action.icon"
                class="drawer-quick-action-icon"
              />
              <span class="drawer-quick-action-label">{{ action.label }}</span>
              <span v-if="action.description" class="drawer-quick-action-description">
                {{ action.description }}
              </span>
            </button>
          </div>
        </div>

        <!-- List items -->
        <div v-if="items && items.length > 0" class="drawer-items">
          <button
            v-for="(item, index) in items"
            :key="item.id || index"
            @click="handleItemClick(item, index)"
            :disabled="item.disabled"
            :class="getItemClasses(item)"
          >
            <div class="drawer-item-content">
              <component
                v-if="item.icon"
                :is="item.icon"
                class="drawer-item-icon"
              />
              <div>
                <div class="drawer-item-label">{{ item.label }}</div>
                <div v-if="item.description" class="drawer-item-description">
                  {{ item.description }}
                </div>
              </div>
            </div>
            
            <div class="drawer-item-meta">
              <span v-if="item.badge" class="drawer-item-badge">
                {{ item.badge }}
              </span>
              <svg class="drawer-item-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer with actions -->
      <div
        v-if="showFooter !== false && actions && actions.length > 0"
        :class="getFooterClasses()"
      >
        <div class="drawer-footer-actions">
          <button
            v-for="(action, index) in actions"
            :key="action.id || index"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :class="getActionButtonClasses(action)"
          >
            <component
              v-if="action.icon"
              :is="action.icon"
              class="drawer-action-icon"
            />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  props: {
    content: {
      type: Object,
      default: () => ({})
    },
    open: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpen: this.open,
      isDragging: false,
      dragStartY: 0,
      currentTranslateY: 0
    }
  },
  computed: {
    direction() {
      return this.content.direction || 'bottom'
    },
    customClass() {
      return this.content.customClass || ''
    },
    customStyle() {
      return this.content.customStyle || {}
    },
    title() {
      return this.content.title
    },
    description() {
      return this.content.description
    },
    showHandle() {
      return this.content.showHandle !== false
    },
    showHeader() {
      return this.content.showHeader !== false
    },
    showClose() {
      return this.content.showClose !== false
    },
    closeLabel() {
      return this.content.closeLabel
    },
    contentClass() {
      return this.content.contentClass || ''
    },
    quickActions() {
      return this.content.quickActions || []
    },
    items() {
      return this.content.items || []
    },
    showFooter() {
      return this.content.showFooter !== false
    },
    footerClass() {
      return this.content.footerClass || ''
    },
    actions() {
      return this.content.actions || []
    },
    closeOnBackdrop() {
      return this.content.closeOnBackdrop !== false
    },
    closeOnEscape() {
      return this.content.closeOnEscape !== false
    },
    dragToClose() {
      return this.content.dragToClose
    }
  },
  watch: {
    open(newValue) {
      this.isOpen = newValue
      if (newValue) {
        // Focus the drawer when opened
        this.$nextTick(() => {
          const drawerElement = document.querySelector('[role="dialog"]')
          if (drawerElement) {
            drawerElement.focus()
          }
        })
      }
    }
  },
  methods: {
    getBackdropClasses() {
      return [
        'drawer-backdrop',
        this.isOpen ? 'drawer-backdrop--visible' : 'drawer-backdrop--hidden'
      ].filter(Boolean).join(' ')
    },
    getDrawerClasses() {
      return [
        'drawer',
        this.direction === 'bottom' || !this.direction ? 'drawer--bottom' : '',
        this.direction === 'top' ? 'drawer--top' : '',
        this.direction === 'left' ? 'drawer--left' : '',
        this.direction === 'right' ? 'drawer--right' : '',
        this.customClass
      ].filter(Boolean).join(' ')
    },
    getHeaderClasses() {
      return [
        'drawer-header',
        this.showHandle !== false && (this.direction === 'bottom' || this.direction === 'top' || !this.direction) ? 'drawer-header--with-handle' : ''
      ].filter(Boolean).join(' ')
    },
    getContentClasses() {
      return [
        'drawer-content',
        this.showHeader === false ? 'drawer-content--no-header' : '',
        this.contentClass
      ].filter(Boolean).join(' ')
    },
    getQuickActionClasses(action) {
      return [
        'drawer-quick-action',
        action.disabled ? 'drawer-quick-action--disabled' : ''
      ].filter(Boolean).join(' ')
    },
    getItemClasses(item) {
      return [
        'drawer-item',
        item.disabled ? 'drawer-item--disabled' : ''
      ].filter(Boolean).join(' ')
    },
    getFooterClasses() {
      return [
        'drawer-footer',
        this.footerClass
      ].filter(Boolean).join(' ')
    },
    getActionButtonClasses(action) {
      return [
        'drawer-action-button',
        action.variant === 'default' || !action.variant ? 'drawer-action-button--default' : '',
        action.variant === 'destructive' ? 'drawer-action-button--destructive' : '',
        action.variant === 'outline' ? 'drawer-action-button--outline' : '',
        action.variant === 'secondary' ? 'drawer-action-button--secondary' : '',
        action.variant === 'ghost' ? 'drawer-action-button--ghost' : '',
        action.customClass
      ].filter(Boolean).join(' ')
    },

    closeDrawer() {
      this.isOpen = false
      this.$emit('update:open', false)
      this.$emit('close')
    },

    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.closeDrawer()
      }
    },

    handleKeyDown(event) {
      if (event.key === 'Escape' && this.closeOnEscape) {
        event.preventDefault()
        this.closeDrawer()
      }
    },

    handleAction(action) {
      this.$emit('action-click', { action })
      
      if (action.closeDrawer !== false) {
        this.closeDrawer()
      }
    },

    handleItemClick(item, index) {
      if (item.disabled) return
      
      this.$emit('item-click', { item, index })
      
      if (item.closeDrawer !== false) {
        this.closeDrawer()
      }
    },

    handleQuickAction(action) {
      if (action.disabled) return
      
      this.$emit('quick-action-click', { action })
      
      if (action.closeDrawer !== false) {
        this.closeDrawer()
      }
    },

    // Drag to close functionality (for mobile)
    handleDragStart(event) {
      if (!this.dragToClose) return
      
      this.isDragging = true
      this.dragStartY = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
      this.currentTranslateY = 0
      
      const handleDragMove = (moveEvent) => {
        if (!this.isDragging) return
        
        const currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY
        const deltaY = currentY - this.dragStartY
        
        // Only allow downward drag for bottom drawer
        if (this.direction === 'bottom' || !this.direction) {
          if (deltaY > 0) {
            this.currentTranslateY = deltaY
            const drawerElement = document.querySelector('[role="dialog"]')
            if (drawerElement) {
              drawerElement.style.transform = `translateY(${deltaY}px)`
            }
          }
        }
      }
      
      const handleDragEnd = () => {
        if (!this.isDragging) return
        
        this.isDragging = false
        
        // Close if dragged down enough (>100px)
        if (this.currentTranslateY > 100) {
          this.closeDrawer()
        } else {
          // Snap back
          const drawerElement = document.querySelector('[role="dialog"]')
          if (drawerElement) {
            drawerElement.style.transform = 'translateY(0)'
          }
        }
        
        this.currentTranslateY = 0
        
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
        document.removeEventListener('touchmove', handleDragMove)
        document.removeEventListener('touchend', handleDragEnd)
      }
      
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      document.addEventListener('touchmove', handleDragMove)
      document.addEventListener('touchend', handleDragEnd)
    }
  }
}
</script>

<style scoped>
/* Shadcn UI CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --muted: 210 40% 98%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --ring: 212.7 26.8% 83.9%;
}

/* Drawer Backdrop */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: hsl(var(--background) / 0.8);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.drawer-backdrop--visible {
  opacity: 1;
}

.drawer-backdrop--hidden {
  opacity: 0;
  pointer-events: none;
}

/* Drawer Container */
.drawer {
  position: fixed;
  z-index: 50;
  display: flex;
  height: auto;
  flex-direction: column;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--background));
  animation: drawer-enter 0.3s ease-out;
}

@keyframes drawer-enter {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer--bottom {
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 96%;
  border-radius: 10px 10px 0 0;
}

.drawer--top {
  left: 0;
  right: 0;
  top: 0;
  max-height: 96%;
  border-radius: 0 0 10px 10px;
  animation-name: drawer-enter-top;
}

@keyframes drawer-enter-top {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drawer--left {
  top: 0;
  bottom: 0;
  left: 0;
  height: 100%;
  width: 75%;
  max-width: 384px;
  border-radius: 0 10px 10px 0;
  animation-name: drawer-enter-left;
}

@keyframes drawer-enter-left {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.drawer--right {
  top: 0;
  bottom: 0;
  right: 0;
  height: 100%;
  width: 75%;
  max-width: 384px;
  border-radius: 10px 0 0 10px;
  animation-name: drawer-enter-right;
}

@keyframes drawer-enter-right {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Drag Handle */
.drawer-handle {
  margin: 16px auto 0;
  height: 8px;
  width: 100px;
  border-radius: 9999px;
  background-color: hsl(var(--muted));
  cursor: grab;
}

.drawer-handle:active {
  cursor: grabbing;
}

/* Header */
.drawer-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  text-align: center;
}

.drawer-header--with-handle {
  padding-top: 8px;
}

.drawer-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
}

.drawer-description {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.drawer-close-button {
  position: absolute;
  right: 16px;
  top: 16px;
  border-radius: 2px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  outline: none;
}

.drawer-close-button:hover {
  opacity: 1;
}

.drawer-close-button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.drawer-close-icon {
  height: 16px;
  width: 16px;
}

/* Content */
.drawer-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.drawer-content--no-header {
  padding-top: 32px;
}

/* Quick Actions */
.drawer-quick-actions {
  margin-bottom: 24px;
}

.drawer-quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .drawer-quick-actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.drawer-quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid hsl(var(--border));
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
  background: none;
  cursor: pointer;
}

.drawer-quick-action:hover:not(.drawer-quick-action--disabled) {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.drawer-quick-action--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drawer-quick-action-icon {
  margin-bottom: 8px;
  height: 24px;
  width: 24px;
}

.drawer-quick-action-label {
  font-size: 14px;
  font-weight: 500;
}

.drawer-quick-action-description {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

/* Items */
.drawer-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drawer-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  transition: all 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
}

.drawer-item:hover:not(.drawer-item--disabled) {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.drawer-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drawer-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-item-icon {
  height: 20px;
  width: 20px;
  color: hsl(var(--muted-foreground));
}

.drawer-item-label {
  font-weight: 500;
}

.drawer-item-description {
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.drawer-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawer-item-badge {
  border-radius: 9999px;
  background-color: hsl(var(--primary));
  padding: 4px 8px;
  font-size: 12px;
  color: hsl(var(--primary-foreground));
}

.drawer-item-chevron {
  height: 16px;
  width: 16px;
  color: hsl(var(--muted-foreground));
}

/* Footer */
.drawer-footer {
  border-top: 1px solid hsl(var(--border));
  padding: 16px;
}

.drawer-footer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 640px) {
  .drawer-footer-actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* Action Buttons */
.drawer-action-button {
  display: inline-flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.drawer-action-button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.drawer-action-button:disabled {
  pointer-events: none;
  opacity: 0.5;
}

.drawer-action-button--default {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

.drawer-action-button--default:hover {
  background-color: hsl(var(--primary) / 0.9);
}

.drawer-action-button--destructive {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.drawer-action-button--destructive:hover {
  background-color: hsl(var(--destructive) / 0.9);
}

.drawer-action-button--outline {
  border: 1px solid hsl(var(--input));
  background-color: hsl(var(--background));
}

.drawer-action-button--outline:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.drawer-action-button--secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
}

.drawer-action-button--secondary:hover {
  background-color: hsl(var(--secondary) / 0.8);
}

.drawer-action-button--ghost:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

.drawer-action-icon {
  margin-right: 8px;
  height: 16px;
  width: 16px;
}
</style> 
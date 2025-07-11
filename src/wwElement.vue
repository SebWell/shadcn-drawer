<template>
  <!-- Backdrop -->
  <teleport to="body">
    <div
      v-if="isOpen"
      :class="cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )"
      @click="handleBackdropClick"
    />
    
    <!-- Drawer container -->
    <div
      v-if="isOpen"
      :class="cn(
        'fixed z-50 flex h-auto flex-col rounded-t-[10px] border bg-background',
        // Bottom drawer (default mobile pattern)
        direction === 'bottom' || !direction ? 'inset-x-0 bottom-0 max-h-[96%]' : '',
        // Top drawer
        direction === 'top' ? 'inset-x-0 top-0 max-h-[96%] rounded-t-none rounded-b-[10px]' : '',
        // Left drawer (for desktop)
        direction === 'left' ? 'inset-y-0 left-0 h-full w-3/4 max-w-sm rounded-r-[10px] rounded-l-none' : '',
        // Right drawer (for desktop)
        direction === 'right' ? 'inset-y-0 right-0 h-full w-3/4 max-w-sm rounded-l-[10px] rounded-r-none' : '',
        // Animation classes
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        direction === 'bottom' || !direction ? 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom' : '',
        direction === 'top' ? 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top' : '',
        direction === 'left' ? 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left' : '',
        direction === 'right' ? 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right' : '',
        customClass
      )"
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
        class="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted cursor-grab active:cursor-grabbing"
        @mousedown="handleDragStart"
        @touchstart="handleDragStart"
      />

      <!-- Header -->
      <div 
        v-if="showHeader !== false"
        :class="cn(
          'flex flex-col space-y-1.5 p-4 text-center sm:text-left',
          showHandle !== false && (direction === 'bottom' || direction === 'top' || !direction) ? 'pt-2' : ''
        )"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2
              v-if="title"
              id="drawer-title"
              class="text-lg font-semibold leading-none tracking-tight"
            >
              {{ title }}
            </h2>
            <p
              v-if="description"
              id="drawer-description"
              class="text-sm text-muted-foreground"
            >
              {{ description }}
            </p>
          </div>
          
          <!-- Close button -->
          <button
            v-if="showClose !== false"
            @click="closeDrawer"
            :class="cn(
              'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none'
            )"
            :aria-label="closeLabel || 'Close'"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div 
        :class="cn(
          'flex-1 overflow-auto p-4',
          showHeader === false ? 'pt-8' : '',
          contentClass
        )"
      >
        <!-- Custom content -->
        <div v-if="content" v-html="content" />
        
        <!-- Quick actions -->
        <div v-if="quickActions && quickActions.length > 0" class="mb-6">
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              v-for="(action, index) in quickActions"
              :key="action.id || index"
              @click="handleQuickAction(action)"
              :disabled="action.disabled"
              :class="cn(
                'flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors hover:bg-accent',
                action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-accent-foreground'
              )"
            >
              <component
                v-if="action.icon"
                :is="action.icon"
                class="mb-2 h-6 w-6"
              />
              <span class="text-sm font-medium">{{ action.label }}</span>
              <span v-if="action.description" class="text-xs text-muted-foreground">
                {{ action.description }}
              </span>
            </button>
          </div>
        </div>

        <!-- List items -->
        <div v-if="items && items.length > 0" class="space-y-1">
          <button
            v-for="(item, index) in items"
            :key="item.id || index"
            @click="handleItemClick(item, index)"
            :disabled="item.disabled"
            :class="cn(
              'flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors',
              item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent hover:text-accent-foreground'
            )"
          >
            <div class="flex items-center space-x-3">
              <component
                v-if="item.icon"
                :is="item.icon"
                class="h-5 w-5 text-muted-foreground"
              />
              <div>
                <div class="font-medium">{{ item.label }}</div>
                <div v-if="item.description" class="text-sm text-muted-foreground">
                  {{ item.description }}
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span v-if="item.badge" class="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                {{ item.badge }}
              </span>
              <svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Footer with actions -->
      <div
        v-if="showFooter !== false && actions && actions.length > 0"
        :class="cn(
          'border-t p-4',
          footerClass
        )"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            v-for="(action, index) in actions"
            :key="action.id || index"
            @click="handleAction(action)"
            :disabled="action.disabled"
            :class="cn(
              'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              // Action variants
              action.variant === 'default' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '',
              action.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : '',
              action.variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : '',
              action.variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : '',
              action.variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' : '',
              !action.variant ? 'bg-primary text-primary-foreground hover:bg-primary/90' : '',
              action.customClass
            )"
          >
            <component
              v-if="action.icon"
              :is="action.icon"
              class="mr-2 h-4 w-4"
            />
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

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
  emits: ['update:open', 'close', 'action-click', 'item-click', 'quick-action-click'],
  setup(props, { emit }) {
    // Import utility function
    const cn = (...inputs) => {
      return inputs.filter(Boolean).join(' ')
    }

    const isOpen = ref(props.open)
    const isDragging = ref(false)
    const dragStartY = ref(0)
    const currentTranslateY = ref(0)

    // Watch for external open changes
    watch(() => props.open, (newValue) => {
      isOpen.value = newValue
      if (newValue) {
        // Focus the drawer when opened
        nextTick(() => {
          const drawerElement = document.querySelector('[role="dialog"]')
          if (drawerElement) {
            drawerElement.focus()
          }
        })
      }
    })

    const closeDrawer = () => {
      isOpen.value = false
      emit('update:open', false)
      emit('close')
    }

    const handleBackdropClick = () => {
      if (props.closeOnBackdrop !== false) {
        closeDrawer()
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && props.closeOnEscape !== false) {
        event.preventDefault()
        closeDrawer()
      }
    }

    const handleAction = (action) => {
      emit('action-click', { action })
      
      if (action.closeDrawer !== false) {
        closeDrawer()
      }
    }

    const handleItemClick = (item, index) => {
      if (item.disabled) return
      
      emit('item-click', { item, index })
      
      if (item.closeDrawer !== false) {
        closeDrawer()
      }
    }

    const handleQuickAction = (action) => {
      if (action.disabled) return
      
      emit('quick-action-click', { action })
      
      if (action.closeDrawer !== false) {
        closeDrawer()
      }
    }

    // Drag to close functionality (for mobile)
    const handleDragStart = (event) => {
      if (!props.dragToClose) return
      
      isDragging.value = true
      dragStartY.value = event.type === 'mousedown' ? event.clientY : event.touches[0].clientY
      currentTranslateY.value = 0
      
      const handleDragMove = (moveEvent) => {
        if (!isDragging.value) return
        
        const currentY = moveEvent.type === 'mousemove' ? moveEvent.clientY : moveEvent.touches[0].clientY
        const deltaY = currentY - dragStartY.value
        
        // Only allow downward drag for bottom drawer
        if (props.direction === 'bottom' || !props.direction) {
          if (deltaY > 0) {
            currentTranslateY.value = deltaY
            const drawerElement = document.querySelector('[role="dialog"]')
            if (drawerElement) {
              drawerElement.style.transform = `translateY(${deltaY}px)`
            }
          }
        }
      }
      
      const handleDragEnd = () => {
        if (!isDragging.value) return
        
        isDragging.value = false
        
        // Close if dragged down enough (>100px)
        if (currentTranslateY.value > 100) {
          closeDrawer()
        } else {
          // Snap back
          const drawerElement = document.querySelector('[role="dialog"]')
          if (drawerElement) {
            drawerElement.style.transform = 'translateY(0)'
          }
        }
        
        currentTranslateY.value = 0
        
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

    return {
      cn,
      isOpen,
      closeDrawer,
      handleBackdropClick,
      handleKeyDown,
      handleAction,
      handleItemClick,
      handleQuickAction,
      handleDragStart
    }
  }
}
</script>

<style>
/* Import global shadcn/ui styles */
@import './globals.css';
</style> 
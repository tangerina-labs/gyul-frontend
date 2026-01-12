import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Badges & Alerts
 * 
 * Badges: default, secondary, outline, destructive, custom colors, status badges
 * Alerts: information, success, warning, error
 */

const BadgesAndAlertsPage = defineComponent({
  name: 'BadgesAndAlertsPage',
  setup() {
    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Badges & Alerts'),

      // Badges
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Badges'),
        
        // Variants
        h('div', { class: 'mb-8' }, [
          h('h4', { class: 'mb-4 text-sm font-medium text-muted-foreground' }, 'Variants'),
          h('div', { class: 'flex flex-wrap gap-4' }, [
            h('span', { class: 'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground' }, 'Default'),
            h('span', { class: 'inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground' }, 'Secondary'),
            h('span', { class: 'inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground' }, 'Outline'),
            h('span', { class: 'inline-flex items-center rounded-md bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground' }, 'Destructive'),
          ]),
        ]),
        
        // Custom Colors
        h('div', { class: 'mb-8' }, [
          h('h4', { class: 'mb-4 text-sm font-medium text-muted-foreground' }, 'Custom Colors'),
          h('div', { class: 'flex flex-wrap gap-4' }, [
            h('span', { class: 'inline-flex items-center rounded-md bg-success px-2 py-0.5 text-xs font-medium text-success-foreground' }, 'Success'),
            h('span', { class: 'inline-flex items-center rounded-md bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground' }, 'Warning'),
            h('span', { class: 'inline-flex items-center rounded-md bg-info px-2 py-0.5 text-xs font-medium text-info-foreground' }, 'Info'),
            h('span', { class: 'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground' }, 'Primary'),
          ]),
        ]),
        
        // Status Badges
        h('div', {}, [
          h('h4', { class: 'mb-4 text-sm font-medium text-muted-foreground' }, 'Status Badges'),
          h('div', { class: 'flex flex-wrap gap-4' }, [
            h('span', { class: 'inline-flex items-center rounded-md border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success' }, 'Active'),
            h('span', { class: 'inline-flex items-center rounded-md border border-warning/20 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning' }, 'Pending'),
            h('span', { class: 'inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground' }, 'Inactive'),
            h('span', { class: 'inline-flex items-center rounded-md border border-info/20 bg-info/10 px-2 py-0.5 text-xs font-medium text-info' }, 'Processing'),
          ]),
        ]),
      ]),

      // Alerts
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Alerts'),
        h('div', { class: 'space-y-4 max-w-3xl' }, [
          // Information Alert
          h('div', { class: 'relative w-full rounded-lg border border-border bg-card p-4', role: 'alert' }, [
            h('div', { class: 'flex gap-3' }, [
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'mt-0.5 text-foreground',
              }, [
                h('circle', { cx: '12', cy: '12', r: '10' }),
                h('path', { d: 'M12 16v-4' }),
                h('path', { d: 'M12 8h.01' }),
              ]),
              h('div', {}, [
                h('h5', { class: 'font-medium text-foreground' }, 'Information'),
                h('p', { class: 'text-sm text-muted-foreground mt-1' }, 'This is an informational alert. Use it to provide helpful context or tips.'),
              ]),
            ]),
          ]),

          // Success Alert
          h('div', { class: 'relative w-full rounded-lg border border-success bg-success/5 p-4', role: 'alert' }, [
            h('div', { class: 'flex gap-3' }, [
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'mt-0.5 text-success',
              }, [
                h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
                h('path', { d: 'M22 4 12 14.01l-3-3' }),
              ]),
              h('div', {}, [
                h('h5', { class: 'font-medium text-foreground' }, 'Success'),
                h('p', { class: 'text-sm text-muted-foreground mt-1' }, 'Your changes have been saved successfully.'),
              ]),
            ]),
          ]),

          // Warning Alert
          h('div', { class: 'relative w-full rounded-lg border border-warning bg-warning/5 p-4', role: 'alert' }, [
            h('div', { class: 'flex gap-3' }, [
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'mt-0.5 text-warning',
              }, [
                h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3' }),
                h('path', { d: 'M12 9v4' }),
                h('path', { d: 'M12 17h.01' }),
              ]),
              h('div', {}, [
                h('h5', { class: 'font-medium text-foreground' }, 'Warning'),
                h('p', { class: 'text-sm text-muted-foreground mt-1' }, 'Please review your input before proceeding.'),
              ]),
            ]),
          ]),

          // Error Alert
          h('div', { class: 'relative w-full rounded-lg border border-destructive bg-destructive/5 p-4', role: 'alert' }, [
            h('div', { class: 'flex gap-3' }, [
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'mt-0.5 text-destructive',
              }, [
                h('circle', { cx: '12', cy: '12', r: '10' }),
                h('path', { d: 'm15 9-6 6' }),
                h('path', { d: 'm9 9 6 6' }),
              ]),
              h('div', {}, [
                h('h5', { class: 'font-medium text-destructive' }, 'Error'),
                h('p', { class: 'text-sm text-destructive/90 mt-1' }, 'Something went wrong. Please try again later.'),
              ]),
            ]),
          ]),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Badges & Alerts',
  component: BadgesAndAlertsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Badge and alert components for status indicators and notifications.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllBadgesAndAlerts: Story = {
  render: () => ({
    components: { BadgesAndAlertsPage },
    template: '<BadgesAndAlertsPage />',
  }),
}

export const Badges: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-6">
        <div>
          <h4 class="mb-4 text-sm font-medium text-muted-foreground">Badge Variants</h4>
          <div class="flex flex-wrap gap-4">
            <span class="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Default</span>
            <span class="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">Secondary</span>
            <span class="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground">Outline</span>
            <span class="inline-flex items-center rounded-md bg-destructive px-2 py-0.5 text-xs font-medium text-destructive-foreground">Destructive</span>
          </div>
        </div>
        
        <div>
          <h4 class="mb-4 text-sm font-medium text-muted-foreground">Semantic Colors</h4>
          <div class="flex flex-wrap gap-4">
            <span class="inline-flex items-center rounded-md bg-success px-2 py-0.5 text-xs font-medium text-success-foreground">Success</span>
            <span class="inline-flex items-center rounded-md bg-warning px-2 py-0.5 text-xs font-medium text-warning-foreground">Warning</span>
            <span class="inline-flex items-center rounded-md bg-info px-2 py-0.5 text-xs font-medium text-info-foreground">Info</span>
          </div>
        </div>
        
        <div>
          <h4 class="mb-4 text-sm font-medium text-muted-foreground">Status Badges</h4>
          <div class="flex flex-wrap gap-4">
            <span class="inline-flex items-center rounded-md border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Active</span>
            <span class="inline-flex items-center rounded-md border border-warning/20 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Pending</span>
            <span class="inline-flex items-center rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Error</span>
            <span class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Alerts: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-4 max-w-2xl">
        <div class="relative w-full rounded-lg border border-border bg-card p-4" role="alert">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 text-foreground">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <div>
              <h5 class="font-medium text-foreground">Information</h5>
              <p class="text-sm text-muted-foreground mt-1">This is an informational alert with helpful context.</p>
            </div>
          </div>
        </div>
        
        <div class="relative w-full rounded-lg border border-success bg-success/5 p-4" role="alert">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <path d="M22 4 12 14.01l-3-3"/>
            </svg>
            <div>
              <h5 class="font-medium text-foreground">Success</h5>
              <p class="text-sm text-muted-foreground mt-1">Your changes have been saved successfully.</p>
            </div>
          </div>
        </div>
        
        <div class="relative w-full rounded-lg border border-warning bg-warning/5 p-4" role="alert">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 text-warning">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
            <div>
              <h5 class="font-medium text-foreground">Warning</h5>
              <p class="text-sm text-muted-foreground mt-1">Please review your input before proceeding.</p>
            </div>
          </div>
        </div>
        
        <div class="relative w-full rounded-lg border border-destructive bg-destructive/5 p-4" role="alert">
          <div class="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mt-0.5 text-destructive">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>
            <div>
              <h5 class="font-medium text-destructive">Error</h5>
              <p class="text-sm text-destructive/90 mt-1">Something went wrong. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

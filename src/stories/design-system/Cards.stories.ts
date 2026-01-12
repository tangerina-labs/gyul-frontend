import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Cards
 * 
 * Card components with:
 * - Header, content, footer sections
 * - Stat cards for metrics
 * - Interactive cards with hover effects
 * - Featured cards with colored borders
 */

const CardsPage = defineComponent({
  name: 'CardsPage',
  setup() {
    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Cards'),

      // Basic Cards
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Basic Cards'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
          // Simple Card
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'p-6' }, [
              h('h4', { class: 'font-medium mb-1' }, 'Simple Card'),
              h('p', { class: 'text-sm text-muted-foreground mb-4' }, 'A basic card with title and description'),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('p', { class: 'text-sm' }, 'This is the card content area where you can put any information.'),
            ]),
          ]),

          // Card with Footer
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'p-6' }, [
              h('h4', { class: 'font-medium mb-1' }, 'Card with Footer'),
              h('p', { class: 'text-sm text-muted-foreground mb-4' }, 'Includes action buttons'),
            ]),
            h('div', { class: 'px-6 pb-4' }, [
              h('p', { class: 'text-sm' }, 'Card content goes here with various elements.'),
            ]),
            h('div', { class: 'flex gap-2 px-6 pb-6' }, [
              h('button', { class: 'h-8 px-3 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90' }, 'Action'),
              h('button', { class: 'h-8 px-3 text-xs rounded-md border border-input bg-background hover:bg-accent' }, 'Cancel'),
            ]),
          ]),

          // Card with Icon
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'p-6' }, [
              h('div', { class: 'flex items-center gap-2 mb-4' }, [
                h('div', { class: 'p-2 bg-primary/10 rounded-lg' }, [
                  h('svg', {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '20',
                    height: '20',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    'stroke-width': '2',
                    class: 'text-primary',
                  }, [
                    h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
                    h('path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' }),
                  ]),
                ]),
                h('div', {}, [
                  h('h4', { class: 'font-medium' }, 'With Icon'),
                  h('p', { class: 'text-sm text-muted-foreground' }, 'Icon in header'),
                ]),
              ]),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('p', { class: 'text-sm' }, 'Cards can include icons and badges for visual emphasis.'),
            ]),
          ]),
        ]),
      ]),

      // Stat Cards
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Stat Cards'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
          // Total Users
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'flex items-center justify-between p-6 pb-2' }, [
              h('h4', { class: 'text-sm font-medium' }, 'Total Users'),
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'text-muted-foreground',
              }, [
                h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
                h('circle', { cx: '9', cy: '7', r: '4' }),
                h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
                h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
              ]),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('div', { class: 'text-2xl font-bold' }, '2,543'),
              h('p', { class: 'text-xs text-muted-foreground mt-1' }, [
                h('span', { class: 'text-success' }, '+12%'),
                ' from last month',
              ]),
            ]),
          ]),

          // Revenue
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'flex items-center justify-between p-6 pb-2' }, [
              h('h4', { class: 'text-sm font-medium' }, 'Revenue'),
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'text-muted-foreground',
              }, [
                h('polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17' }),
                h('polyline', { points: '16 7 22 7 22 13' }),
              ]),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('div', { class: 'text-2xl font-bold' }, '$45,231'),
              h('p', { class: 'text-xs text-muted-foreground mt-1' }, [
                h('span', { class: 'text-success' }, '+20%'),
                ' from last month',
              ]),
            ]),
          ]),

          // Active Now
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border' }, [
            h('div', { class: 'flex items-center justify-between p-6 pb-2' }, [
              h('h4', { class: 'text-sm font-medium' }, 'Active Now'),
              h('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                width: '16',
                height: '16',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': '2',
                class: 'text-muted-foreground',
              }, [
                h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
                h('path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' }),
              ]),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('div', { class: 'text-2xl font-bold' }, '573'),
              h('p', { class: 'text-xs text-muted-foreground mt-1' }, [
                h('span', { class: 'text-destructive' }, '-5%'),
                ' from last hour',
              ]),
            ]),
          ]),
        ]),
      ]),

      // Interactive Cards
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Interactive Cards'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
          // Hoverable Card
          h('div', { class: 'bg-card text-card-foreground rounded-xl border border-border hover:shadow-lg transition-shadow cursor-pointer' }, [
            h('div', { class: 'p-6' }, [
              h('div', { class: 'flex items-center justify-between mb-1' }, [
                h('h4', { class: 'font-medium' }, 'Hoverable Card'),
                h('span', { class: 'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground' }, 'New'),
              ]),
              h('p', { class: 'text-sm text-muted-foreground mb-4' }, 'Hover over this card to see the effect'),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('p', { class: 'text-sm' }, 'This card has a hover effect that increases the shadow.'),
            ]),
          ]),

          // Featured Card
          h('div', { class: 'bg-card text-card-foreground rounded-xl border-2 border-primary' }, [
            h('div', { class: 'p-6' }, [
              h('div', { class: 'flex items-center justify-between mb-1' }, [
                h('h4', { class: 'font-medium' }, 'Featured Card'),
                h('span', { class: 'inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground' }, 'Featured'),
              ]),
              h('p', { class: 'text-sm text-muted-foreground mb-4' }, 'This card has a colored border'),
            ]),
            h('div', { class: 'px-6 pb-6' }, [
              h('p', { class: 'text-sm' }, 'Use colored borders to highlight important cards.'),
            ]),
          ]),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Cards',
  component: CardsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Card components for displaying content in contained sections with various layouts and styles.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllCards: Story = {
  render: () => ({
    components: { CardsPage },
    template: '<CardsPage />',
  }),
}

export const BasicCard: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <div class="max-w-md bg-card text-card-foreground rounded-xl border border-border">
          <div class="p-6">
            <h4 class="font-medium mb-1">Card Title</h4>
            <p class="text-sm text-muted-foreground">Card description goes here</p>
          </div>
          <div class="px-6 pb-6">
            <p class="text-sm">This is the main content area of the card. You can put any content here.</p>
          </div>
          <div class="flex gap-2 px-6 pb-6 border-t border-border pt-4">
            <button class="h-9 px-4 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Save</button>
            <button class="h-9 px-4 text-sm rounded-md border border-input bg-background hover:bg-accent">Cancel</button>
          </div>
        </div>
      </div>
    `,
  }),
}

export const StatCards: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div class="bg-card text-card-foreground rounded-xl border border-border">
            <div class="flex items-center justify-between p-6 pb-2">
              <h4 class="text-sm font-medium">Total Users</h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div class="px-6 pb-6">
              <div class="text-2xl font-bold">2,543</div>
              <p class="text-xs text-muted-foreground mt-1">
                <span class="text-success">+12%</span> from last month
              </p>
            </div>
          </div>
          
          <div class="bg-card text-card-foreground rounded-xl border border-border">
            <div class="flex items-center justify-between p-6 pb-2">
              <h4 class="text-sm font-medium">Revenue</h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              </svg>
            </div>
            <div class="px-6 pb-6">
              <div class="text-2xl font-bold">$45,231</div>
              <p class="text-xs text-muted-foreground mt-1">
                <span class="text-success">+20%</span> from last month
              </p>
            </div>
          </div>
          
          <div class="bg-card text-card-foreground rounded-xl border border-border">
            <div class="flex items-center justify-between p-6 pb-2">
              <h4 class="text-sm font-medium">Active Now</h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted-foreground">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="px-6 pb-6">
              <div class="text-2xl font-bold">573</div>
              <p class="text-xs text-muted-foreground mt-1">
                <span class="text-destructive">-5%</span> from last hour
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const InteractiveCards: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div class="bg-card text-card-foreground rounded-xl border border-border hover:shadow-lg transition-shadow cursor-pointer">
            <div class="p-6">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-medium">Hoverable Card</h4>
                <span class="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">New</span>
              </div>
              <p class="text-sm text-muted-foreground">Hover to see shadow effect</p>
            </div>
          </div>
          
          <div class="bg-card text-card-foreground rounded-xl border-2 border-primary">
            <div class="p-6">
              <div class="flex items-center justify-between mb-1">
                <h4 class="font-medium">Featured Card</h4>
                <span class="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">Featured</span>
              </div>
              <p class="text-sm text-muted-foreground">Primary colored border</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

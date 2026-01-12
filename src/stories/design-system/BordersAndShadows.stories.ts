import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Borders & Shadows
 * 
 * Border radius scale: sm, md, lg, xl, 2xl
 * Shadow scale: sm, md, lg, xl
 * Border styles and colors
 */

const BordersAndShadowsPage = defineComponent({
  name: 'BordersAndShadowsPage',
  setup() {
    const radiusValues = [
      { name: 'SM', value: '0.25rem', cssVar: '--radius-sm' },
      { name: 'MD', value: '0.375rem', cssVar: '--radius-md' },
      { name: 'LG', value: '0.5rem', cssVar: '--radius-lg' },
      { name: 'XL', value: '0.75rem', cssVar: '--radius-xl' },
      { name: '2XL', value: '1rem', cssVar: '--radius-2xl' },
    ]

    const shadowValues = [
      {
        name: 'SM',
        value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        cssVar: '--shadow-sm',
        description: 'Subtle shadow for minimal depth',
      },
      {
        name: 'MD',
        value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        cssVar: '--shadow-md',
        description: 'Medium shadow for cards',
      },
      {
        name: 'LG',
        value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        cssVar: '--shadow-lg',
        description: 'Large shadow for elevated elements',
      },
      {
        name: 'XL',
        value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        cssVar: '--shadow-xl',
        description: 'Extra large shadow for modals',
      },
    ]

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Borders & Shadows'),

      // Border Radius
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Border Radius'),
        h('div', { class: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6' },
          radiusValues.map(radius =>
            h('div', { key: radius.name, class: 'space-y-2' }, [
              h('div', {
                class: 'h-24 bg-primary',
                style: { borderRadius: radius.value },
              }),
              h('div', {}, [
                h('p', { class: 'font-medium text-foreground' }, radius.name),
                h('p', { class: 'text-sm text-muted-foreground' }, radius.value),
                h('p', { class: 'text-xs text-muted-foreground font-mono' }, radius.cssVar),
              ]),
            ])
          )
        ),
      ]),

      // Shadows
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Shadows'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
          shadowValues.map(shadow =>
            h('div', { key: shadow.name, class: 'space-y-2' }, [
              h('div', {
                class: 'h-32 bg-card rounded-lg flex items-center justify-center',
                style: { boxShadow: shadow.value },
              }, [
                h('p', { class: 'font-medium text-foreground' }, shadow.name),
              ]),
              h('div', {}, [
                h('p', { class: 'font-medium text-foreground' }, shadow.name),
                h('p', { class: 'text-sm text-muted-foreground' }, shadow.description),
                h('p', { class: 'text-xs text-muted-foreground font-mono' }, shadow.cssVar),
              ]),
            ])
          )
        ),
      ]),

      // Border Styles
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Border Styles'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-6' }, [
          h('div', { class: 'p-6 border border-border rounded-lg bg-card' }, [
            h('p', { class: 'font-medium mb-2 text-foreground' }, 'Default Border'),
            h('p', { class: 'text-sm text-muted-foreground' }, '1px solid var(--border)'),
          ]),
          h('div', { class: 'p-6 border-2 border-primary rounded-lg bg-card' }, [
            h('p', { class: 'font-medium mb-2 text-foreground' }, 'Primary Border'),
            h('p', { class: 'text-sm text-muted-foreground' }, '2px solid var(--primary)'),
          ]),
          h('div', { class: 'p-6 border-2 border-dashed border-border rounded-lg bg-card' }, [
            h('p', { class: 'font-medium mb-2 text-foreground' }, 'Dashed Border'),
            h('p', { class: 'text-sm text-muted-foreground' }, '2px dashed var(--border)'),
          ]),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Borders & Shadows',
  component: BordersAndShadowsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Border radius, shadow levels, and border styles for the design system.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllBordersAndShadows: Story = {
  render: () => ({
    components: { BordersAndShadowsPage },
    template: '<BordersAndShadowsPage />',
  }),
}

export const BorderRadius: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Border Radius</h3>
        <div class="flex flex-wrap gap-6">
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-sm mb-2"></div>
            <p class="text-sm">rounded-sm</p>
          </div>
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-md mb-2"></div>
            <p class="text-sm">rounded-md</p>
          </div>
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-lg mb-2"></div>
            <p class="text-sm">rounded-lg</p>
          </div>
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-xl mb-2"></div>
            <p class="text-sm">rounded-xl</p>
          </div>
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-2xl mb-2"></div>
            <p class="text-sm">rounded-2xl</p>
          </div>
          <div class="text-center">
            <div class="w-24 h-24 bg-primary rounded-full mb-2"></div>
            <p class="text-sm">rounded-full</p>
          </div>
        </div>
      </div>
    `,
  }),
}

export const Shadows: Story = {
  render: () => ({
    template: `
      <div class="p-8 bg-muted">
        <h3 class="mb-6 text-lg font-medium">Shadows</h3>
        <div class="flex flex-wrap gap-8">
          <div class="text-center">
            <div class="w-32 h-32 bg-card rounded-lg shadow-sm flex items-center justify-center mb-2">
              <span class="text-sm text-muted-foreground">shadow-sm</span>
            </div>
          </div>
          <div class="text-center">
            <div class="w-32 h-32 bg-card rounded-lg shadow-md flex items-center justify-center mb-2">
              <span class="text-sm text-muted-foreground">shadow-md</span>
            </div>
          </div>
          <div class="text-center">
            <div class="w-32 h-32 bg-card rounded-lg shadow-lg flex items-center justify-center mb-2">
              <span class="text-sm text-muted-foreground">shadow-lg</span>
            </div>
          </div>
          <div class="text-center">
            <div class="w-32 h-32 bg-card rounded-lg shadow-xl flex items-center justify-center mb-2">
              <span class="text-sm text-muted-foreground">shadow-xl</span>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

export const BorderStyles: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Border Styles</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-4 border border-border rounded-lg">
            <p class="font-medium">border</p>
            <p class="text-sm text-muted-foreground">1px solid</p>
          </div>
          <div class="p-4 border-2 border-border rounded-lg">
            <p class="font-medium">border-2</p>
            <p class="text-sm text-muted-foreground">2px solid</p>
          </div>
          <div class="p-4 border-2 border-primary rounded-lg">
            <p class="font-medium">border-primary</p>
            <p class="text-sm text-muted-foreground">Primary color</p>
          </div>
          <div class="p-4 border-2 border-dashed border-border rounded-lg">
            <p class="font-medium">border-dashed</p>
            <p class="text-sm text-muted-foreground">Dashed style</p>
          </div>
        </div>
      </div>
    `,
  }),
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Spacing
 * 
 * Consistent spacing scale from 0 to 24 (6rem)
 * Used for margins, paddings, gaps, and layout
 */

const SpacingPage = defineComponent({
  name: 'SpacingPage',
  setup() {
    const spacingValues = [
      { name: '0', value: '0', cssVar: '--spacing-0' },
      { name: '1', value: '0.25rem', cssVar: '--spacing-1' },
      { name: '2', value: '0.5rem', cssVar: '--spacing-2' },
      { name: '3', value: '0.75rem', cssVar: '--spacing-3' },
      { name: '4', value: '1rem', cssVar: '--spacing-4' },
      { name: '5', value: '1.25rem', cssVar: '--spacing-5' },
      { name: '6', value: '1.5rem', cssVar: '--spacing-6' },
      { name: '8', value: '2rem', cssVar: '--spacing-8' },
      { name: '10', value: '2.5rem', cssVar: '--spacing-10' },
      { name: '12', value: '3rem', cssVar: '--spacing-12' },
      { name: '16', value: '4rem', cssVar: '--spacing-16' },
      { name: '20', value: '5rem', cssVar: '--spacing-20' },
      { name: '24', value: '6rem', cssVar: '--spacing-24' },
    ]

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Spacing'),
      
      h('div', { class: 'space-y-4' },
        spacingValues.map(spacing => 
          h('div', { 
            key: spacing.name, 
            class: 'flex items-center gap-8' 
          }, [
            h('div', { class: 'w-32 shrink-0' }, [
              h('p', { class: 'font-medium text-foreground' }, spacing.name),
              h('p', { class: 'text-sm text-muted-foreground' }, spacing.value),
              h('p', { class: 'text-xs text-muted-foreground font-mono' }, spacing.cssVar),
            ]),
            h('div', { class: 'flex items-center gap-4 flex-1' }, [
              h('div', {
                class: 'h-8 bg-primary rounded',
                style: { width: spacing.value },
              }),
              h('span', { class: 'text-sm text-muted-foreground' }, spacing.value),
            ]),
          ])
        )
      ),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Spacing',
  component: SpacingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Spacing scale used for consistent margins, paddings, and gaps throughout the design system.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllSpacing: Story = {
  render: () => ({
    components: { SpacingPage },
    template: '<SpacingPage />',
  }),
}

export const SpacingExamples: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-8">
        <h3 class="text-lg font-medium">Spacing in Practice</h3>
        
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">Gap Examples (using flex/grid gap)</p>
          
          <div class="flex gap-1 items-center">
            <div class="w-8 h-8 bg-primary rounded" v-for="i in 4" :key="i"></div>
            <span class="ml-4 text-sm text-muted-foreground">gap-1 (0.25rem)</span>
          </div>
          
          <div class="flex gap-2 items-center">
            <div class="w-8 h-8 bg-primary rounded" v-for="i in 4" :key="i"></div>
            <span class="ml-4 text-sm text-muted-foreground">gap-2 (0.5rem)</span>
          </div>
          
          <div class="flex gap-4 items-center">
            <div class="w-8 h-8 bg-primary rounded" v-for="i in 4" :key="i"></div>
            <span class="ml-4 text-sm text-muted-foreground">gap-4 (1rem)</span>
          </div>
          
          <div class="flex gap-6 items-center">
            <div class="w-8 h-8 bg-primary rounded" v-for="i in 4" :key="i"></div>
            <span class="ml-4 text-sm text-muted-foreground">gap-6 (1.5rem)</span>
          </div>
          
          <div class="flex gap-8 items-center">
            <div class="w-8 h-8 bg-primary rounded" v-for="i in 4" :key="i"></div>
            <span class="ml-4 text-sm text-muted-foreground">gap-8 (2rem)</span>
          </div>
        </div>
        
        <div class="space-y-4 mt-8">
          <p class="text-sm text-muted-foreground">Padding Examples</p>
          
          <div class="inline-block">
            <div class="p-2 bg-accent border border-border rounded">
              <div class="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">p-2 (0.5rem)</div>
            </div>
          </div>
          
          <div class="inline-block ml-4">
            <div class="p-4 bg-accent border border-border rounded">
              <div class="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">p-4 (1rem)</div>
            </div>
          </div>
          
          <div class="inline-block ml-4">
            <div class="p-6 bg-accent border border-border rounded">
              <div class="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">p-6 (1.5rem)</div>
            </div>
          </div>
          
          <div class="inline-block ml-4">
            <div class="p-8 bg-accent border border-border rounded">
              <div class="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">p-8 (2rem)</div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
}

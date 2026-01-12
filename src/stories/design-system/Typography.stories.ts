import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Typography
 * 
 * Type scale from xs (0.75rem) to 5xl (3rem)
 * Font weights: normal, medium, semibold, bold
 * Default headings: h1-h4
 */

const TypographyPage = defineComponent({
  name: 'TypographyPage',
  setup() {
    const typographyScale = [
      { name: '5XL', size: '3rem', cssVar: '--text-5xl', sample: 'The quick brown fox' },
      { name: '4XL', size: '2.25rem', cssVar: '--text-4xl', sample: 'The quick brown fox jumps' },
      { name: '3XL', size: '1.875rem', cssVar: '--text-3xl', sample: 'The quick brown fox jumps over' },
      { name: '2XL', size: '1.5rem', cssVar: '--text-2xl', sample: 'The quick brown fox jumps over the lazy dog' },
      { name: 'XL', size: '1.25rem', cssVar: '--text-xl', sample: 'The quick brown fox jumps over the lazy dog' },
      { name: 'LG', size: '1.125rem', cssVar: '--text-lg', sample: 'The quick brown fox jumps over the lazy dog' },
      { name: 'Base', size: '1rem', cssVar: '--text-base', sample: 'The quick brown fox jumps over the lazy dog' },
      { name: 'SM', size: '0.875rem', cssVar: '--text-sm', sample: 'The quick brown fox jumps over the lazy dog' },
      { name: 'XS', size: '0.75rem', cssVar: '--text-xs', sample: 'The quick brown fox jumps over the lazy dog' },
    ]

    const fontWeights = [
      { name: 'Normal', value: '400', cssVar: '--font-weight-normal' },
      { name: 'Medium', value: '500', cssVar: '--font-weight-medium' },
      { name: 'Semibold', value: '600', cssVar: '--font-weight-semibold' },
      { name: 'Bold', value: '700', cssVar: '--font-weight-bold' },
    ]

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Typography'),
      
      // Type Scale
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Type Scale'),
        h('div', { class: 'space-y-6' }, 
          typographyScale.map(type => 
            h('div', { 
              key: type.name, 
              class: 'flex items-center gap-8 pb-6 border-b border-border' 
            }, [
              h('div', { class: 'w-24 shrink-0' }, [
                h('p', { class: 'font-medium text-foreground' }, type.name),
                h('p', { class: 'text-sm text-muted-foreground' }, type.size),
                h('p', { class: 'text-xs text-muted-foreground font-mono' }, type.cssVar),
              ]),
              h('p', { style: { fontSize: type.size } }, type.sample),
            ])
          )
        ),
      ]),

      // Font Weights
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Font Weights'),
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
          fontWeights.map(weight => 
            h('div', { 
              key: weight.name, 
              class: 'p-6 border border-border rounded-lg bg-card' 
            }, [
              h('p', { 
                class: 'text-2xl mb-2 text-foreground', 
                style: { fontWeight: weight.value } 
              }, 'Aa'),
              h('p', { class: 'font-medium text-foreground' }, weight.name),
              h('p', { class: 'text-sm text-muted-foreground' }, weight.value),
              h('p', { class: 'text-xs text-muted-foreground font-mono' }, weight.cssVar),
            ])
          )
        ),
      ]),

      // Headings
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Headings'),
        h('div', { class: 'space-y-4' }, [
          h('div', {}, [
            h('h1', {}, 'Heading 1 - Main page title'),
            h('p', { class: 'text-sm text-muted-foreground mt-1' }, '<h1> - 1.5rem (24px)'),
          ]),
          h('div', {}, [
            h('h2', {}, 'Heading 2 - Section title'),
            h('p', { class: 'text-sm text-muted-foreground mt-1' }, '<h2> - 1.25rem (20px)'),
          ]),
          h('div', {}, [
            h('h3', {}, 'Heading 3 - Subsection title'),
            h('p', { class: 'text-sm text-muted-foreground mt-1' }, '<h3> - 1.125rem (18px)'),
          ]),
          h('div', {}, [
            h('h4', {}, 'Heading 4 - Component title'),
            h('p', { class: 'text-sm text-muted-foreground mt-1' }, '<h4> - 1rem (16px)'),
          ]),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Typography',
  component: TypographyPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Typography system including type scale, font weights, and heading styles.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllTypography: Story = {
  render: () => ({
    components: { TypographyPage },
    template: '<TypographyPage />',
  }),
}

export const TypeScale: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Type Scale</h3>
        <div class="space-y-4">
          <p class="text-5xl">Text 5XL - 3rem</p>
          <p class="text-4xl">Text 4XL - 2.25rem</p>
          <p class="text-3xl">Text 3XL - 1.875rem</p>
          <p class="text-2xl">Text 2XL - 1.5rem</p>
          <p class="text-xl">Text XL - 1.25rem</p>
          <p class="text-lg">Text LG - 1.125rem</p>
          <p class="text-base">Text Base - 1rem</p>
          <p class="text-sm">Text SM - 0.875rem</p>
          <p class="text-xs">Text XS - 0.75rem</p>
        </div>
      </div>
    `,
  }),
}

export const FontWeights: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Font Weights</h3>
        <div class="space-y-4 text-2xl">
          <p class="font-normal">Font Normal (400) - The quick brown fox</p>
          <p class="font-medium">Font Medium (500) - The quick brown fox</p>
          <p class="font-semibold">Font Semibold (600) - The quick brown fox</p>
          <p class="font-bold">Font Bold (700) - The quick brown fox</p>
        </div>
      </div>
    `,
  }),
}

export const Headings: Story = {
  render: () => ({
    template: `
      <div class="p-8 space-y-6">
        <h3 class="mb-6 text-lg font-medium text-muted-foreground">Native Heading Elements</h3>
        <h1>Heading 1 - Main page title</h1>
        <h2>Heading 2 - Section title</h2>
        <h3>Heading 3 - Subsection title</h3>
        <h4>Heading 4 - Component title</h4>
      </div>
    `,
  }),
}

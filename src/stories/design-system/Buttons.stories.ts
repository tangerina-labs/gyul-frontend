import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Buttons
 * 
 * Button variants: default, secondary, outline, ghost, link, destructive
 * Button sizes: sm, default, lg, icon
 * States: normal, hover, disabled
 */

// Simple button component using design system classes
const Button = defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as () => 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive',
      default: 'default',
    },
    size: {
      type: String as () => 'sm' | 'default' | 'lg' | 'icon',
      default: 'default',
    },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    
    const variantClasses: Record<string, string> = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }
    
    const sizeClasses: Record<string, string> = {
      sm: 'h-8 rounded-md px-3 text-xs',
      default: 'h-9 px-4 py-2',
      lg: 'h-10 rounded-md px-6',
      icon: 'h-9 w-9',
    }
    
    return () => h('button', {
      class: [baseClasses, variantClasses[props.variant], sizeClasses[props.size]],
      disabled: props.disabled,
    }, slots.default?.())
  },
})

const ButtonsPage = defineComponent({
  name: 'ButtonsPage',
  components: { Button },
  setup() {
    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Buttons'),

      // Variants
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Variants'),
        h('div', { class: 'flex flex-wrap gap-4' }, [
          h(Button, { variant: 'default' }, () => 'Default'),
          h(Button, { variant: 'secondary' }, () => 'Secondary'),
          h(Button, { variant: 'outline' }, () => 'Outline'),
          h(Button, { variant: 'ghost' }, () => 'Ghost'),
          h(Button, { variant: 'link' }, () => 'Link'),
          h(Button, { variant: 'destructive' }, () => 'Destructive'),
        ]),
      ]),

      // Sizes
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'Sizes'),
        h('div', { class: 'flex flex-wrap items-center gap-4' }, [
          h(Button, { size: 'sm' }, () => 'Small'),
          h(Button, { size: 'default' }, () => 'Default'),
          h(Button, { size: 'lg' }, () => 'Large'),
          h(Button, { size: 'icon' }, () => h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }, [
            h('path', { d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' }),
            h('circle', { cx: '12', cy: '12', r: '3' }),
          ])),
        ]),
      ]),

      // With Icons
      h('div', { class: 'mb-12' }, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'With Icons'),
        h('div', { class: 'flex flex-wrap gap-4' }, [
          h(Button, { variant: 'default' }, () => [
            h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              class: 'mr-2',
            }, [
              h('rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }),
              h('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }),
            ]),
            'Send Email',
          ]),
          h(Button, { variant: 'secondary' }, () => [
            h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              class: 'mr-2',
            }, [
              h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
              h('polyline', { points: '7 10 12 15 17 10' }),
              h('line', { x1: '12', x2: '12', y1: '15', y2: '3' }),
            ]),
            'Download',
          ]),
          h(Button, { variant: 'destructive' }, () => [
            h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              class: 'mr-2',
            }, [
              h('path', { d: 'M3 6h18' }),
              h('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
              h('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
              h('line', { x1: '10', x2: '10', y1: '11', y2: '17' }),
              h('line', { x1: '14', x2: '14', y1: '11', y2: '17' }),
            ]),
            'Delete',
          ]),
        ]),
      ]),

      // States
      h('div', {}, [
        h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, 'States'),
        h('div', { class: 'flex flex-wrap gap-4' }, [
          h(Button, { variant: 'default' }, () => 'Normal'),
          h(Button, { variant: 'default', disabled: true }, () => 'Disabled'),
          h(Button, { variant: 'outline' }, () => 'Hover Me'),
          h(Button, { variant: 'secondary' }, () => 'Focus Me'),
        ]),
      ]),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Buttons',
  component: ButtonsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Button component with multiple variants, sizes, and states.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllButtons: Story = {
  render: () => ({
    components: { ButtonsPage },
    template: '<ButtonsPage />',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Button Variants</h3>
        <div class="flex flex-wrap gap-4">
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Default
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Secondary
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
            Outline
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 hover:bg-accent hover:text-accent-foreground">
            Ghost
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 text-primary underline-offset-4 hover:underline">
            Link
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Destructive
          </button>
        </div>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Button Sizes</h3>
        <div class="flex flex-wrap items-center gap-4">
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            Small
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Default
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
            Large
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
    `,
  }),
}

export const States: Story = {
  render: () => ({
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Button States</h3>
        <div class="flex flex-wrap gap-4">
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            Normal
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground opacity-50 pointer-events-none" disabled>
            Disabled
          </button>
          <button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Focus (Tab to me)
          </button>
        </div>
      </div>
    `,
  }),
}

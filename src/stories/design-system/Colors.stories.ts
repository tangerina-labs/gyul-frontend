import type { Meta, StoryObj } from '@storybook/vue3'
import { h, defineComponent } from 'vue'

/**
 * Design System Colors
 * 
 * Complete color palette including:
 * - Brand colors (Orange)
 * - Orange scale (50-900)
 * - Gray scale (50-900)
 * - Semantic colors (success, warning, destructive, info)
 * - UI colors (background, foreground, muted, accent, border)
 */

const ColorSwatch = defineComponent({
  name: 'ColorSwatch',
  props: {
    name: { type: String, required: true },
    value: { type: String, required: true },
    cssVar: { type: String, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'space-y-2' }, [
      h('div', {
        class: 'h-24 rounded-lg border border-border shadow-sm',
        style: { backgroundColor: props.value },
      }),
      h('div', {}, [
        h('p', { class: 'font-medium text-foreground' }, props.name),
        h('p', { class: 'text-sm text-muted-foreground' }, props.value),
        h('p', { class: 'text-xs text-muted-foreground font-mono' }, props.cssVar),
      ]),
    ])
  },
})

const ColorSection = defineComponent({
  name: 'ColorSection',
  props: {
    title: { type: String, required: true },
    colors: { type: Array as () => Array<{ name: string; value: string; cssVar: string }>, required: true },
  },
  setup(props) {
    return () => h('div', { class: 'mb-12' }, [
      h('h3', { class: 'mb-6 text-lg font-medium text-foreground' }, props.title),
      h('div', { class: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6' },
        props.colors.map(color => 
          h(ColorSwatch, { key: color.name, ...color })
        )
      ),
    ])
  },
})

const ColorsPage = defineComponent({
  name: 'ColorsPage',
  setup() {
    const colorGroups = [
      {
        title: 'Brand Colors',
        colors: [
          { name: 'Primary', value: '#EA7D3C', cssVar: '--primary' },
          { name: 'Secondary', value: '#F39C50', cssVar: '--secondary' },
        ],
      },
      {
        title: 'Orange Scale',
        colors: [
          { name: 'Orange 50', value: '#FFF5EE', cssVar: '--orange-50' },
          { name: 'Orange 100', value: '#FFE8D9', cssVar: '--orange-100' },
          { name: 'Orange 200', value: '#FFD0B3', cssVar: '--orange-200' },
          { name: 'Orange 300', value: '#FFB88C', cssVar: '--orange-300' },
          { name: 'Orange 400', value: '#F39C50', cssVar: '--orange-400' },
          { name: 'Orange 500', value: '#EA7D3C', cssVar: '--orange-500' },
          { name: 'Orange 600', value: '#D66A2E', cssVar: '--orange-600' },
          { name: 'Orange 700', value: '#B85724', cssVar: '--orange-700' },
          { name: 'Orange 800', value: '#9A451B', cssVar: '--orange-800' },
          { name: 'Orange 900', value: '#7C3413', cssVar: '--orange-900' },
        ],
      },
      {
        title: 'Gray Scale',
        colors: [
          { name: 'Gray 50', value: '#fafafa', cssVar: '--gray-50' },
          { name: 'Gray 100', value: '#f5f5f5', cssVar: '--gray-100' },
          { name: 'Gray 200', value: '#e5e5e5', cssVar: '--gray-200' },
          { name: 'Gray 300', value: '#d4d4d4', cssVar: '--gray-300' },
          { name: 'Gray 400', value: '#a3a3a3', cssVar: '--gray-400' },
          { name: 'Gray 500', value: '#737373', cssVar: '--gray-500' },
          { name: 'Gray 600', value: '#525252', cssVar: '--gray-600' },
          { name: 'Gray 700', value: '#404040', cssVar: '--gray-700' },
          { name: 'Gray 800', value: '#262626', cssVar: '--gray-800' },
          { name: 'Gray 900', value: '#171717', cssVar: '--gray-900' },
        ],
      },
      {
        title: 'Semantic Colors',
        colors: [
          { name: 'Success', value: '#22c55e', cssVar: '--success' },
          { name: 'Warning', value: '#f59e0b', cssVar: '--warning' },
          { name: 'Destructive', value: '#ef4444', cssVar: '--destructive' },
          { name: 'Info', value: '#3b82f6', cssVar: '--info' },
        ],
      },
      {
        title: 'UI Colors',
        colors: [
          { name: 'Background', value: '#ffffff', cssVar: '--background' },
          { name: 'Foreground', value: '#1a1a1a', cssVar: '--foreground' },
          { name: 'Muted', value: '#f5f5f5', cssVar: '--muted' },
          { name: 'Accent', value: '#FFF5EE', cssVar: '--accent' },
          { name: 'Border', value: '#e5e5e5', cssVar: '--border' },
        ],
      },
    ]

    return () => h('section', { class: 'p-8' }, [
      h('h2', { class: 'mb-8 text-xl font-medium text-foreground' }, 'Colors'),
      ...colorGroups.map(group => 
        h(ColorSection, { key: group.title, title: group.title, colors: group.colors })
      ),
    ])
  },
})

const meta: Meta = {
  title: 'Design System/Colors',
  component: ColorsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete color palette for the Design System including brand colors, color scales, semantic colors, and UI colors.',
      },
    },
  },
}

export default meta
type Story = StoryObj

export const AllColors: Story = {
  render: () => ({
    components: { ColorsPage },
    template: '<ColorsPage />',
  }),
}

export const BrandColors: Story = {
  render: () => ({
    setup() {
      const colors = [
        { name: 'Primary', value: '#EA7D3C', cssVar: '--primary' },
        { name: 'Secondary', value: '#F39C50', cssVar: '--secondary' },
      ]
      return { colors, ColorSwatch }
    },
    components: { ColorSwatch },
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Brand Colors</h3>
        <div class="grid grid-cols-2 gap-6 max-w-md">
          <ColorSwatch
            v-for="color in colors"
            :key="color.name"
            :name="color.name"
            :value="color.value"
            :css-var="color.cssVar"
          />
        </div>
      </div>
    `,
  }),
}

export const OrangeScale: Story = {
  render: () => ({
    setup() {
      const colors = [
        { name: 'Orange 50', value: '#FFF5EE', cssVar: '--orange-50' },
        { name: 'Orange 100', value: '#FFE8D9', cssVar: '--orange-100' },
        { name: 'Orange 200', value: '#FFD0B3', cssVar: '--orange-200' },
        { name: 'Orange 300', value: '#FFB88C', cssVar: '--orange-300' },
        { name: 'Orange 400', value: '#F39C50', cssVar: '--orange-400' },
        { name: 'Orange 500', value: '#EA7D3C', cssVar: '--orange-500' },
        { name: 'Orange 600', value: '#D66A2E', cssVar: '--orange-600' },
        { name: 'Orange 700', value: '#B85724', cssVar: '--orange-700' },
        { name: 'Orange 800', value: '#9A451B', cssVar: '--orange-800' },
        { name: 'Orange 900', value: '#7C3413', cssVar: '--orange-900' },
      ]
      return { colors, ColorSwatch }
    },
    components: { ColorSwatch },
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Orange Scale</h3>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          <ColorSwatch
            v-for="color in colors"
            :key="color.name"
            :name="color.name"
            :value="color.value"
            :css-var="color.cssVar"
          />
        </div>
      </div>
    `,
  }),
}

export const SemanticColors: Story = {
  render: () => ({
    setup() {
      const colors = [
        { name: 'Success', value: '#22c55e', cssVar: '--success' },
        { name: 'Warning', value: '#f59e0b', cssVar: '--warning' },
        { name: 'Destructive', value: '#ef4444', cssVar: '--destructive' },
        { name: 'Info', value: '#3b82f6', cssVar: '--info' },
      ]
      return { colors, ColorSwatch }
    },
    components: { ColorSwatch },
    template: `
      <div class="p-8">
        <h3 class="mb-6 text-lg font-medium">Semantic Colors</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ColorSwatch
            v-for="color in colors"
            :key="color.name"
            :name="color.name"
            :value="color.value"
            :css-var="color.cssVar"
          />
        </div>
      </div>
    `,
  }),
}

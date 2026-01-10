import type { Preview } from '@storybook/vue3'
import '../src/style.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: '#F9FAFB' },
        { name: 'white', value: '#FFFFFF' },
        { name: 'dark', value: '#1F2937' },
      ],
    },
    layout: 'padded',
  },
}

export default preview

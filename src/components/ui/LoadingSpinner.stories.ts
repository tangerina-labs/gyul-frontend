import type { Meta, StoryObj } from '@storybook/vue3'
import LoadingSpinner from './LoadingSpinner.vue'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof LoadingSpinner>

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

// ALL SIZES - Shows all sizes simultaneously
export const AllSizes: Story = {
  render: () => ({
    components: { LoadingSpinner },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">All Spinner Sizes</h2>
          <div style="display: flex; align-items: center; gap: 48px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
              <LoadingSpinner size="sm" />
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase;">Small (16px)</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
              <LoadingSpinner size="md" />
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase;">Medium (24px)</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
              <LoadingSpinner size="lg" />
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase;">Large (32px)</span>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">In Context</h2>
          <div style="display: flex; gap: 32px;">
            <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: white; border-radius: 8px; border: 1px solid #E5E7EB;">
              <LoadingSpinner size="sm" />
              <span style="font-size: 14px; color: #6B7280;">Loading...</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px; background: white; border-radius: 12px; border: 1px solid #E5E7EB; min-width: 200px;">
              <LoadingSpinner size="lg" />
              <span style="font-size: 14px; color: #6B7280;">Carregando tweet...</span>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
}

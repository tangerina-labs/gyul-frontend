import type { Meta, StoryObj } from '@storybook/vue3'
import CanvasCardSkeleton from './CanvasCardSkeleton.vue'

const meta: Meta<typeof CanvasCardSkeleton> = {
  title: 'UI/CanvasCardSkeleton',
  component: CanvasCardSkeleton,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CanvasCardSkeleton>

export const Default: Story = {}

// ALL STATES - Shows skeleton in different contexts
export const AllStates: Story = {
  render: () => ({
    components: { CanvasCardSkeleton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Single Skeleton</h2>
          <div style="max-width: 350px;">
            <CanvasCardSkeleton />
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Loading Grid (Canvas List)</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px;">
            <CanvasCardSkeleton />
            <CanvasCardSkeleton />
            <CanvasCardSkeleton />
            <CanvasCardSkeleton />
            <CanvasCardSkeleton />
            <CanvasCardSkeleton />
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Mixed with Real Cards</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 900px;">
            <!-- Real card -->
            <div style="background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">My Canvas</h3>
              <p style="font-size: 12px; color: #6B7280; margin-bottom: 16px;">Updated 2 hours ago</p>
              <div style="height: 80px; background: #F9FAFB; border-radius: 8px;"></div>
            </div>
            <!-- Skeleton -->
            <CanvasCardSkeleton />
            <!-- Skeleton -->
            <CanvasCardSkeleton />
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
}

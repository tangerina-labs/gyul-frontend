import type { Meta, StoryObj } from '@storybook/vue3'
import AddNodeHandle from './AddNodeHandle.vue'

const meta: Meta<typeof AddNodeHandle> = {
  title: 'Canvas/AddNodeHandle',
  component: AddNodeHandle,
  tags: ['autodocs'],
  argTypes: {
    visible: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof AddNodeHandle>

export const Visible: Story = {
  args: {
    visible: true,
  },
}

export const Hidden: Story = {
  args: {
    visible: false,
  },
}

// ALL STATES - Shows all handle states
export const AllStates: Story = {
  render: () => ({
    components: { AddNodeHandle },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding: 32px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Handle States</h2>
          <div style="display: flex; gap: 64px; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Visible (Default)
              </p>
              <div style="padding: 32px; background: white; border-radius: 12px; border: 1px solid #E5E7EB;">
                <AddNodeHandle :visible="true" />
              </div>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Hidden
              </p>
              <div style="padding: 32px; background: white; border-radius: 12px; border: 1px solid #E5E7EB; min-width: 80px; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                <AddNodeHandle :visible="false" />
                <span style="color: #9CA3AF; font-size: 12px;">(handle hidden)</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">In Context (Node Footer)</h2>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6B7280;">
            Hover over the handle to see the tooltip
          </p>
          <div style="width: 300px; padding: 16px; background: white; border-radius: 12px; border: 2px solid #4F46E5; position: relative;">
            <p style="font-size: 14px; color: #374151;">Tweet node content...</p>
            <div style="display: flex; justify-content: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              <AddNodeHandle :visible="true" />
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Multiple Handles</h2>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6B7280;">
            Used at connection points between nodes
          </p>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 250px; padding: 12px; background: white; border-radius: 8px; border: 2px solid #A78BFA; text-align: center;">
              Question Node
            </div>
            <AddNodeHandle :visible="true" />
            <div style="width: 2px; height: 40px; background: #E5E7EB;"></div>
            <AddNodeHandle :visible="true" />
            <div style="width: 250px; padding: 12px; background: #FFFBEB; border-radius: 8px; border: 1px solid #E5E7EB; text-align: center;">
              Note Node
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'canvas' },
  },
}

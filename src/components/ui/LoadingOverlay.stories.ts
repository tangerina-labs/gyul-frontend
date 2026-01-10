import type { Meta, StoryObj } from '@storybook/vue3'
import LoadingOverlay from './LoadingOverlay.vue'

const meta: Meta<typeof LoadingOverlay> = {
  title: 'UI/LoadingOverlay',
  component: LoadingOverlay,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof LoadingOverlay>

export const WithoutMessage: Story = {
  args: {},
  render: (args) => ({
    components: { LoadingOverlay },
    setup() {
      return { args }
    },
    template: `
      <div style="position: relative; width: 400px; height: 300px; background: white; border: 1px solid #E5E7EB; border-radius: 12px;">
        <div style="padding: 16px;">
          <h3>Content behind overlay</h3>
          <p>This content is covered by the loading overlay.</p>
        </div>
        <LoadingOverlay v-bind="args" />
      </div>
    `,
  }),
}

export const WithMessage: Story = {
  args: {
    message: 'Carregando canvas...',
  },
  render: (args) => ({
    components: { LoadingOverlay },
    setup() {
      return { args }
    },
    template: `
      <div style="position: relative; width: 400px; height: 300px; background: white; border: 1px solid #E5E7EB; border-radius: 12px;">
        <div style="padding: 16px;">
          <h3>Content behind overlay</h3>
          <p>This content is covered by the loading overlay.</p>
        </div>
        <LoadingOverlay v-bind="args" />
      </div>
    `,
  }),
}

// ALL STATES - Shows all variations simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { LoadingOverlay },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Loading Overlay Variants</h2>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px;">
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Without Message</p>
              <div style="position: relative; width: 100%; height: 250px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <div style="padding: 16px;">
                  <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Canvas Title</h3>
                  <p style="font-size: 14px; color: #6B7280;">Some content that is being loaded...</p>
                  <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <div style="width: 80px; height: 80px; background: #F3F4F6; border-radius: 8px;"></div>
                    <div style="width: 80px; height: 80px; background: #F3F4F6; border-radius: 8px;"></div>
                  </div>
                </div>
                <LoadingOverlay />
              </div>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">With Message</p>
              <div style="position: relative; width: 100%; height: 250px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <div style="padding: 16px;">
                  <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Canvas Title</h3>
                  <p style="font-size: 14px; color: #6B7280;">Some content that is being loaded...</p>
                  <div style="margin-top: 16px; display: flex; gap: 8px;">
                    <div style="width: 80px; height: 80px; background: #F3F4F6; border-radius: 8px;"></div>
                    <div style="width: 80px; height: 80px; background: #F3F4F6; border-radius: 8px;"></div>
                  </div>
                </div>
                <LoadingOverlay message="Carregando canvas..." />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Different Messages</h2>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Loading Canvas</p>
              <div style="position: relative; width: 100%; height: 150px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <LoadingOverlay message="Carregando canvas..." />
              </div>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Saving</p>
              <div style="position: relative; width: 100%; height: 150px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <LoadingOverlay message="Salvando alteracoes..." />
              </div>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Generating</p>
              <div style="position: relative; width: 100%; height: 150px; background: white; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <LoadingOverlay message="Gerando resposta da IA..." />
              </div>
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

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import { ref } from 'vue'
import CanvasToolbox from './CanvasToolbox.vue'

const meta: Meta<typeof CanvasToolbox> = {
  title: 'Canvas/CanvasToolbox',
  component: CanvasToolbox,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CanvasToolbox>

export const Default: Story = {
  args: {
    isActive: false,
    'onActivate-create-mode': fn(),
  },
}

export const Active: Story = {
  args: {
    isActive: true,
    'onActivate-create-mode': fn(),
  },
}

// ALL STATES - Shows toolbox in different contexts
export const AllStates: Story = {
  render: () => ({
    components: { CanvasToolbox },
    setup() {
      const isActive = ref(false)
      
      const handleActivateCreateMode = () => {
        isActive.value = !isActive.value
        console.log('Create mode:', isActive.value ? 'activated' : 'deactivated')
      }

      return { isActive, handleActivateCreateMode }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding: 32px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Canvas Toolbox</h2>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6B7280;">
            Toolbox for creating new flows. Click the button to toggle active state.
          </p>
          
          <div style="display: flex; gap: 64px; align-items: start;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Interactive
              </p>
              <CanvasToolbox
                :is-active="isActive"
                @activate-create-mode="handleActivateCreateMode"
                style="position: relative;"
              />
              <p style="font-size: 12px; color: #6B7280;">
                Mode: {{ isActive ? 'Creating' : 'Normal' }}
              </p>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Inactive State
              </p>
              <CanvasToolbox
                :is-active="false"
                style="position: relative;"
              />
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Active State
              </p>
              <CanvasToolbox
                :is-active="true"
                style="position: relative;"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">In Canvas Context</h2>
          <div style="position: relative; width: 600px; height: 400px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
            <!-- Simulated canvas background -->
            <div style="position: absolute; inset: 0; opacity: 0.3;">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="#E5E7EB"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)"/>
              </svg>
            </div>
            
            <!-- Toolbox positioned left-center -->
            <CanvasToolbox
              :is-active="isActive"
              @activate-create-mode="handleActivateCreateMode"
            />

            <!-- Hint overlay when creating (simulated) -->
            <div 
              v-if="isActive"
              style="position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 40px rgba(79, 70, 229, 0.15);"
            />
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

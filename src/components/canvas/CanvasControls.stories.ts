import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import CanvasControls from './CanvasControls.vue'

const meta: Meta<typeof CanvasControls> = {
  title: 'Canvas/CanvasControls',
  component: CanvasControls,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CanvasControls>

export const Default: Story = {
  args: {
    onZoomIn: fn(),
    onZoomOut: fn(),
    onFitView: fn(),
  },
}

// ALL STATES - Shows controls in different contexts
export const AllStates: Story = {
  render: () => ({
    components: { CanvasControls },
    setup() {
      const handleZoomIn = () => console.log('Zoom In clicked')
      const handleZoomOut = () => console.log('Zoom Out clicked')
      const handleFitView = () => console.log('Fit View clicked')

      return { handleZoomIn, handleZoomOut, handleFitView }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding: 32px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Canvas Controls</h2>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6B7280;">
            Controls for zoom and navigation. Click buttons to see console logs.
          </p>
          
          <div style="display: flex; gap: 64px; align-items: start;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Isolated
              </p>
              <CanvasControls
                :on-zoom-in="handleZoomIn"
                :on-zoom-out="handleZoomOut"
                :on-fit-view="handleFitView"
                style="position: relative;"
              />
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <p style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                In Canvas Context
              </p>
              <div style="position: relative; width: 400px; height: 300px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
                <!-- Simulated canvas content -->
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3;">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#E5E7EB" stroke-width="1"/>
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#E5E7EB" stroke-width="1"/>
                  </svg>
                </div>
                
                <!-- Controls positioned bottom-right -->
                <CanvasControls
                  :on-zoom-in="handleZoomIn"
                  :on-zoom-out="handleZoomOut"
                  :on-fit-view="handleFitView"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Button Breakdown</h2>
          <div style="display: flex; gap: 48px;">
            <div style="text-align: center;">
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">
                Zoom In
              </p>
              <div style="width: 52px; height: 52px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>

            <div style="text-align: center;">
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">
                Zoom Out
              </p>
              <div style="width: 52px; height: 52px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </div>

            <div style="text-align: center;">
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">
                Fit View
              </p>
              <div style="width: 52px; height: 52px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                </svg>
              </div>
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

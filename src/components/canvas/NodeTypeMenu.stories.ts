import type { Meta, StoryObj } from '@storybook/vue3'
import NodeTypeMenu from './NodeTypeMenu.vue'

const meta: Meta<typeof NodeTypeMenu> = {
  title: 'Canvas/NodeTypeMenu',
  component: NodeTypeMenu,
  tags: ['autodocs'],
  argTypes: {
    x: { control: 'number' },
    y: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof NodeTypeMenu>

export const Default: Story = {
  args: {
    x: 100,
    y: 100,
  },
  render: (args) => ({
    components: { NodeTypeMenu },
    setup() {
      const handleSelect = (type: string) => {
        console.log('Selected type:', type)
      }
      const handleClose = () => {
        console.log('Menu closed')
      }
      return { args, handleSelect, handleClose }
    },
    template: `
      <div style="position: relative; min-height: 400px;">
        <NodeTypeMenu
          :x="args.x"
          :y="args.y"
          @select="handleSelect"
          @close="handleClose"
        />
      </div>
    `,
  }),
}

// ALL STATES - Shows menu in different contexts
export const AllStates: Story = {
  render: () => ({
    components: { NodeTypeMenu },
    setup() {
      const handleSelect = (type: string) => {
        console.log('Selected type:', type)
      }
      const handleClose = () => {
        console.log('Menu closed')
      }

      return { handleSelect, handleClose }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding: 32px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Node Type Menu</h2>
          <p style="margin-bottom: 16px; font-size: 14px; color: #6B7280;">
            Appears when clicking on empty canvas. Click options to see console logs.
          </p>
          
          <div style="display: flex; gap: 64px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Menu (Isolated)
              </p>
              <div style="position: relative; height: 250px;">
                <NodeTypeMenu
                  :x="0"
                  :y="0"
                  @select="handleSelect"
                  @close="handleClose"
                  style="position: relative !important;"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Menu Options</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
            <div style="text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 12px; background: white; border: 2px solid #4F46E5; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#4F46E5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <p style="font-weight: 600; color: #374151; margin-bottom: 4px;">Tweet</p>
              <p style="font-size: 14px; color: #6B7280;">Carregar tweet do Twitter/X</p>
            </div>

            <div style="text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 12px; background: white; border: 2px solid #A78BFA; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/>
                </svg>
              </div>
              <p style="font-weight: 600; color: #374151; margin-bottom: 4px;">Question</p>
              <p style="font-size: 14px; color: #6B7280;">Fazer pergunta para a IA</p>
            </div>

            <div style="text-align: center;">
              <div style="width: 64px; height: 64px; margin: 0 auto 12px; background: #FFFBEB; border: 2px solid #92400E; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                </svg>
              </div>
              <p style="font-weight: 600; color: #374151; margin-bottom: 4px;">Note</p>
              <p style="font-size: 14px; color: #6B7280;">Adicionar anotacao pessoal</p>
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">In Canvas Context</h2>
          <div style="position: relative; width: 600px; height: 400px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden;">
            <!-- Simulated canvas background dots -->
            <div style="position: absolute; inset: 0; background-image: radial-gradient(#E5E7EB 1px, transparent 1px); background-size: 20px 20px;"></div>
            
            <!-- Simulated existing node -->
            <div style="position: absolute; top: 50px; left: 50px; width: 200px; padding: 12px; background: white; border: 2px solid #4F46E5; border-radius: 12px;">
              <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">Tweet loaded</div>
              <div style="font-size: 14px;">Some tweet content here...</div>
            </div>
            
            <!-- Menu positioned where user clicked -->
            <NodeTypeMenu
              :x="280"
              :y="150"
              @select="handleSelect"
              @close="handleClose"
            />
            
            <!-- Click indicator -->
            <div style="position: absolute; top: 148px; left: 278px; width: 8px; height: 8px; background: #4F46E5; border-radius: 50%; animation: pulse 1s infinite;"></div>
          </div>
          <p style="margin-top: 12px; font-size: 14px; color: #6B7280;">
            Blue dot shows where user clicked to open the menu
          </p>
        </section>
      </div>

      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      </style>
    `,
  }),
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'canvas' },
  },
}

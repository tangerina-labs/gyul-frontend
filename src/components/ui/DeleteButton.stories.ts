import type { Meta, StoryObj } from '@storybook/vue3'
import DeleteButton from './DeleteButton.vue'

const meta: Meta<typeof DeleteButton> = {
  title: 'UI/DeleteButton',
  component: DeleteButton,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Desabilita o botao (para nos com filhos)',
    },
    tooltipText: {
      control: 'text',
      description: 'Texto do tooltip',
    },
  },
  parameters: {
    layout: 'centered',
  },
  // Wrapper para simular posicao relativa (como dentro de um node)
  decorators: [
    () => ({
      template: `
        <div style="position: relative; width: 200px; height: 100px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
          Node Content
          <story />
        </div>
      `,
    }),
  ],
}

export default meta
type Story = StoryObj<typeof DeleteButton>

// Default state
export const Default: Story = {
  args: {
    disabled: false,
    tooltipText: 'Deletar',
  },
}

// Disabled state (for nodes with children)
export const Disabled: Story = {
  args: {
    disabled: true,
    tooltipText: 'Este no possui filhos e nao pode ser deletado',
  },
}

// Custom tooltip
export const CustomTooltip: Story = {
  args: {
    disabled: false,
    tooltipText: 'Remover este item',
  },
}

// All states comparison
export const AllStates: Story = {
  render: () => ({
    components: { DeleteButton },
    template: `
      <div style="display: flex; flex-direction: column; gap: 64px; padding: 48px;">
        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Delete Button States</h2>
          <div style="display: flex; gap: 80px;">
            
            <!-- Default State -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <div style="position: relative; width: 180px; height: 80px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
                Node Content
                <DeleteButton />
              </div>
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase;">Default</span>
              <span style="font-size: 11px; color: #9CA3AF;">Hover to see effect</span>
            </div>
            
            <!-- Disabled State -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <div style="position: relative; width: 180px; height: 80px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">
                Has Children
                <DeleteButton disabled tooltip-text="Este no possui filhos e nao pode ser deletado" />
              </div>
              <span style="font-size: 12px; color: #6B7280; text-transform: uppercase;">Disabled</span>
              <span style="font-size: 11px; color: #9CA3AF;">For nodes with children</span>
            </div>
            
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 24px; font-size: 18px; font-weight: 600; color: #374151;">Design Rationale</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 600px;">
            <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
              <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Minimal</h3>
              <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">Fundo transparente e icone cinza muted - nao compete com o conteudo do node.</p>
            </div>
            <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
              <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Soft Danger</h3>
              <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">Hover revela intencao destrutiva com vermelho suave - claro mas nao agressivo.</p>
            </div>
            <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
              <h3 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Refinado</h3>
              <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">Icone de lixeira elegante substitui X generico - mais semantico e sofisticado.</p>
            </div>
          </div>
        </section>
      </div>
    `,
  }),
  decorators: [], // Remove o decorator padrao para esta story
  parameters: {
    layout: 'padded',
  },
}

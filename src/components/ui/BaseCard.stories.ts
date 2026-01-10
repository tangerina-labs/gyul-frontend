import type { Meta, StoryObj } from '@storybook/vue3'
import BaseCard from './BaseCard.vue'

const meta: Meta<typeof BaseCard> = {
  title: 'UI/BaseCard',
  component: BaseCard,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'tweet', 'question', 'note'],
    },
    loading: { control: 'boolean' },
    selected: { control: 'boolean' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof BaseCard>

// Individual stories for controls
export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>Default card content</p>
      </BaseCard>
    `,
  }),
}

export const Tweet: Story = {
  args: {
    variant: 'tweet',
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>Tweet card with indigo border</p>
      </BaseCard>
    `,
  }),
}

export const Question: Story = {
  args: {
    variant: 'question',
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>Question card with purple border</p>
      </BaseCard>
    `,
  }),
}

export const Note: Story = {
  args: {
    variant: 'note',
  },
  render: (args) => ({
    components: { BaseCard },
    setup() {
      return { args }
    },
    template: `
      <BaseCard v-bind="args">
        <p>Note card with yellow background</p>
      </BaseCard>
    `,
  }),
}

// ALL STATES - Shows all variants and states simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { BaseCard },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; max-width: 800px;">
        <!-- Variants Section -->
        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">Variants</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Default</p>
              <BaseCard variant="default">
                <p>Default variant card</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Tweet</p>
              <BaseCard variant="tweet">
                <p>Tweet variant with indigo border</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Question</p>
              <BaseCard variant="question">
                <p>Question variant with purple border</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Note</p>
              <BaseCard variant="note">
                <p>Note variant with yellow background</p>
              </BaseCard>
            </div>
          </div>
        </section>

        <!-- States Section -->
        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">States</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Normal</p>
              <BaseCard variant="tweet">
                <p>Normal state</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Selected</p>
              <BaseCard variant="tweet" :selected="true">
                <p>Selected state with ring</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Loading</p>
              <BaseCard variant="tweet" :loading="true">
                <p>Loading state with pulsing border</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Error</p>
              <BaseCard variant="tweet" :error="true">
                <p>Error state with red border</p>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Disabled</p>
              <BaseCard variant="tweet" :disabled="true">
                <p>Disabled state with reduced opacity</p>
              </BaseCard>
            </div>
          </div>
        </section>

        <!-- Slots Section -->
        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">With Header & Footer</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Tweet with Header</p>
              <BaseCard variant="tweet">
                <template #header>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 40px; height: 40px; background: #E5E7EB; border-radius: 50%;"></div>
                    <div>
                      <div style="font-weight: 600;">Author Name</div>
                      <div style="font-size: 14px; color: #6B7280;">@handle</div>
                    </div>
                  </div>
                </template>
                <p>Tweet content goes here with the expandable text component.</p>
                <template #footer>
                  <div style="font-size: 14px; color: #9CA3AF;">Jan 9, 2026</div>
                </template>
              </BaseCard>
            </div>
            <div>
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Question with Footer</p>
              <BaseCard variant="question">
                <p style="font-weight: 500; margin-bottom: 8px;">Pergunta</p>
                <p>How does the authentication flow work?</p>
                <template #footer>
                  <button style="padding: 8px 16px; background: #A78BFA; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Add follow-up
                  </button>
                </template>
              </BaseCard>
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

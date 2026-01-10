import type { Meta, StoryObj } from '@storybook/vue3'
import ExpandableText from './ExpandableText.vue'

const meta: Meta<typeof ExpandableText> = {
  title: 'UI/ExpandableText',
  component: ExpandableText,
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    lines: { control: 'number' },
    expandLabel: { control: 'text' },
    collapseLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ExpandableText>

const shortText = 'This is a short text that fits in a few lines without truncation.'

const longText = `This is a much longer text that will definitely need to be truncated because it contains multiple paragraphs and a lot of content.

The expandable text component uses CSS line-clamp to truncate the text after a specified number of lines. When the user clicks "Ver mais", the full text is revealed.

This pattern is commonly used in social media applications where tweets or posts can be quite long, but you want to show a preview first to keep the feed compact and scannable.

The component also detects if truncation is actually needed - if the text fits within the allowed lines, no toggle button is shown.`

export const Short: Story = {
  args: {
    text: shortText,
    lines: 3,
  },
}

export const Long: Story = {
  args: {
    text: longText,
    lines: 3,
  },
}

export const CustomLines: Story = {
  args: {
    text: longText,
    lines: 6,
  },
}

// ALL STATES - Shows all variations simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { ExpandableText },
    setup() {
      return { shortText, longText }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; max-width: 500px;">
        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">Text Lengths</h2>
          
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #E5E7EB;">
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Short Text (no truncation)</p>
              <ExpandableText :text="shortText" :lines="3" />
            </div>

            <div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #E5E7EB;">
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Long Text (truncated at 3 lines)</p>
              <ExpandableText :text="longText" :lines="3" />
            </div>

            <div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #E5E7EB;">
              <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Long Text (truncated at 6 lines)</p>
              <ExpandableText :text="longText" :lines="6" />
            </div>
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">Custom Labels</h2>
          
          <div style="padding: 16px; background: white; border-radius: 12px; border: 1px solid #E5E7EB;">
            <p style="margin-bottom: 8px; font-size: 12px; color: #6B7280; text-transform: uppercase;">Custom expand/collapse labels</p>
            <ExpandableText 
              :text="longText" 
              :lines="3" 
              expand-label="Show more"
              collapse-label="Show less"
            />
          </div>
        </section>

        <section>
          <h2 style="margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #374151;">In Tweet Context</h2>
          
          <div style="padding: 16px; background: white; border-radius: 12px; border: 3px solid #4F46E5;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E5E7EB;">
              <div style="width: 48px; height: 48px; background: #E5E7EB; border-radius: 50%;"></div>
              <div>
                <div style="font-weight: 600;">OpenAI</div>
                <div style="font-size: 14px; color: #6B7280;">@OpenAI</div>
              </div>
            </div>
            <ExpandableText 
              :text="longText" 
              :lines="4" 
            />
          </div>
        </section>
      </div>
    `,
  }),
  parameters: {
    layout: 'padded',
  },
}

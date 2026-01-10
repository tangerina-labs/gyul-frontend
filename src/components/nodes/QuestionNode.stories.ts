import type { Meta, StoryObj } from '@storybook/vue3'
import QuestionNode from './QuestionNode.vue'
import type { QuestionData } from '@/types'

const meta: Meta<typeof QuestionNode> = {
  title: 'Nodes/QuestionNode',
  component: QuestionNode,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof QuestionNode>

// Mock data for different states
const draftQuestion: QuestionData = {
  type: 'question',
  flowId: 'flow-1',
  prompt: '',
  response: null,
  status: 'draft',
}

const loadingQuestion: QuestionData = {
  type: 'question',
  flowId: 'flow-1',
  prompt: 'What are the main implications of this announcement for the AI industry?',
  response: null,
  status: 'loading',
}

const doneQuestion: QuestionData = {
  type: 'question',
  flowId: 'flow-1',
  prompt: 'What are the main implications of this announcement for the AI industry?',
  response: `The announcement of GPT-5 has several significant implications for the AI industry:

1. **Competitive Pressure**: Other AI labs will face increased pressure to accelerate their development timelines and release more capable models.

2. **Enterprise Adoption**: The improved reasoning capabilities, especially in mathematics and coding, could drive faster enterprise adoption for complex analytical tasks.

3. **Research Directions**: The focus on multi-step reasoning may influence the broader research community to prioritize similar capabilities.

4. **Regulatory Attention**: More capable models typically attract increased regulatory scrutiny, potentially accelerating AI governance frameworks.

5. **Market Dynamics**: This could reshape competitive dynamics in the AI API market and influence pricing strategies across the industry.`,
  status: 'done',
}

// Individual stories
export const Draft: Story = {
  args: {
    id: 'question-1',
    data: draftQuestion,
    selected: false,
  },
}

export const Loading: Story = {
  args: {
    id: 'question-2',
    data: loadingQuestion,
    selected: false,
  },
}

export const Done: Story = {
  args: {
    id: 'question-3',
    data: doneQuestion,
    selected: false,
  },
}

export const Selected: Story = {
  args: {
    id: 'question-4',
    data: doneQuestion,
    selected: true,
  },
}

// ALL STATES - Shows all QuestionNode states simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { QuestionNode },
    setup() {
      const handleSubmit = (prompt: string) => {
        console.log('Submit prompt:', prompt)
      }
      const handleAddChild = (position: { x: number; y: number }) => {
        console.log('Add child at:', position)
      }
      const handleDelete = () => {
        console.log('Delete node')
      }

      return {
        draftQuestion,
        loadingQuestion,
        doneQuestion,
        handleSubmit,
        handleAddChild,
        handleDelete,
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 64px; padding: 32px;">
        <!-- Status States -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Question Status States</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Draft (Editing)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                User is writing their question
              </p>
              <QuestionNode
                id="question-draft"
                :data="draftQuestion"
                :selected="false"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Loading
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                AI is generating the response
              </p>
              <QuestionNode
                id="question-loading"
                :data="loadingQuestion"
                :selected="false"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div style="grid-column: span 2;">
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Done (Completed)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Response received and displayed
              </p>
              <div style="max-width: 450px;">
                <QuestionNode
                  id="question-done"
                  :data="doneQuestion"
                  :selected="false"
                  @submit="handleSubmit"
                  @add-child="handleAddChild"
                  @delete="handleDelete"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Interactive States -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Interactive States</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Normal
              </p>
              <QuestionNode
                id="question-normal"
                :data="doneQuestion"
                :selected="false"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Selected
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Shows delete button on hover
              </p>
              <QuestionNode
                id="question-selected"
                :data="doneQuestion"
                :selected="true"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>
          </div>
        </section>

        <!-- Different Content Lengths -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Content Variations</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Short Question & Response
              </p>
              <QuestionNode
                id="question-short"
                :data="{
                  type: 'question',
                  flowId: 'flow-1',
                  prompt: 'What is GPT?',
                  response: 'GPT stands for Generative Pre-trained Transformer, a type of large language model.',
                  status: 'done'
                }"
                :selected="false"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Long Question
              </p>
              <QuestionNode
                id="question-long-prompt"
                :data="{
                  type: 'question',
                  flowId: 'flow-1',
                  prompt: 'Given the recent announcement about GPT-5 and its improved reasoning capabilities in mathematics and coding, what do you think will be the most significant impact on software development workflows and how might this change the role of developers in the next 5 years?',
                  response: 'The impact on software development will be profound, transforming how developers work.',
                  status: 'done'
                }"
                :selected="false"
                @submit="handleSubmit"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
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

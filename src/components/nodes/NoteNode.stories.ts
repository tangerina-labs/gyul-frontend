import type { Meta, StoryObj } from '@storybook/vue3'
import NoteNode from './NoteNode.vue'
import type { NoteData } from '@/types'

const meta: Meta<typeof NoteNode> = {
  title: 'Nodes/NoteNode',
  component: NoteNode,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NoteNode>

// Mock data for different states
const editingNote: NoteData = {
  type: 'note',
  flowId: 'flow-1',
  content: '',
  isEditing: true,
}

const readonlyNote: NoteData = {
  type: 'note',
  flowId: 'flow-1',
  content: 'This is an important observation about the tweet thread. The author makes several key points that connect to our earlier research on AI development timelines.',
  isEditing: false,
}

const emptyReadonlyNote: NoteData = {
  type: 'note',
  flowId: 'flow-1',
  content: '',
  isEditing: false,
}

const longNote: NoteData = {
  type: 'note',
  flowId: 'flow-1',
  content: `Key takeaways from this thread:

1. The timeline for AGI is becoming clearer
2. Competition between labs is intensifying
3. Regulatory frameworks are still lagging behind

Need to follow up on:
- Check OpenAI's safety documentation
- Compare with Anthropic's approach
- Review EU AI Act implications`,
  isEditing: false,
}

// Individual stories
export const Editing: Story = {
  args: {
    id: 'note-1',
    data: editingNote,
    selected: false,
  },
}

export const Readonly: Story = {
  args: {
    id: 'note-2',
    data: readonlyNote,
    selected: false,
  },
}

export const EmptyReadonly: Story = {
  args: {
    id: 'note-3',
    data: emptyReadonlyNote,
    selected: false,
  },
}

export const Selected: Story = {
  args: {
    id: 'note-4',
    data: readonlyNote,
    selected: true,
  },
}

// ALL STATES - Shows all NoteNode states simultaneously
export const AllStates: Story = {
  render: () => ({
    components: { NoteNode },
    setup() {
      const handleUpdate = (content: string) => {
        console.log('Update content:', content)
      }
      const handleFinalize = (content: string) => {
        console.log('Finalize with content:', content)
      }
      const handleAddChild = (position: { x: number; y: number }) => {
        console.log('Add child at:', position)
      }
      const handleDelete = () => {
        console.log('Delete node')
      }

      return {
        editingNote,
        readonlyNote,
        emptyReadonlyNote,
        longNote,
        handleUpdate,
        handleFinalize,
        handleAddChild,
        handleDelete,
      }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 64px; padding: 32px;">
        <!-- Editing States -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Note Status States</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Editing (New Note)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                User is writing content. Shows hints below.
              </p>
              <NoteNode
                id="note-editing"
                :data="editingNote"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Readonly (With Content)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Note saved and displayed
              </p>
              <NoteNode
                id="note-readonly"
                :data="readonlyNote"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Readonly (Empty)
              </p>
              <p style="margin-bottom: 16px; font-size: 14px; color: #9CA3AF;">
                Shows "(Nota vazia)" placeholder
              </p>
              <NoteNode
                id="note-empty"
                :data="emptyReadonlyNote"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
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
              <NoteNode
                id="note-normal"
                :data="readonlyNote"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
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
              <NoteNode
                id="note-selected"
                :data="readonlyNote"
                :selected="true"
                @update="handleUpdate"
                @finalize="handleFinalize"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>
          </div>
        </section>

        <!-- Content Variations -->
        <section>
          <h2 style="margin-bottom: 24px; font-size: 20px; font-weight: 600; color: #374151;">Content Variations</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 48px; align-items: start;">
            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Short Note
              </p>
              <NoteNode
                id="note-short"
                :data="{
                  type: 'note',
                  flowId: 'flow-1',
                  content: 'Quick reminder: check back later.',
                  isEditing: false
                }"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
                @add-child="handleAddChild"
                @delete="handleDelete"
              />
            </div>

            <div>
              <p style="margin-bottom: 12px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em;">
                Long Note (Multi-line)
              </p>
              <NoteNode
                id="note-long"
                :data="longNote"
                :selected="false"
                @update="handleUpdate"
                @finalize="handleFinalize"
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

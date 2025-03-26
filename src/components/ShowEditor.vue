<template>
  <div class="editor-wrapper" ref="editorContainer"></div>
</template>

<script>
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { sql } from '@codemirror/lang-sql'
import { okaidia } from '@uiw/codemirror-theme-okaidia'

export default {
  name: 'ShowEditor',
  props: {
    query: {
      type: String,
      required: true,
    },
    showOutputTerminal: {
      type: Boolean,
      default: false,
    },
    fullScreen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:query'],
  data() {
    return {
      editorView: null,
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeUnmount() {
    if (this.editorView) {
      this.editorView.destroy()
    }
  },
  watch: {
    query(newValue) {
      if (this.editorView && this.editorView.state.doc.toString() !== newValue) {
        this.editorView.dispatch({
          changes: { from: 0, to: this.editorView.state.doc.length, insert: newValue },
        })
      }
    },
    showOutputTerminal() {
      this.updateEditorHeight()
    },
    fullScreen() {
      this.updateEditorHeight()
    },
  },
  methods: {
    initEditor() {
      // Custom theme to override the background color and other elements
      const customTheme = EditorView.theme({
        '&': {
          backgroundColor: '#282c34', // Match the editor-wrapper background
        },
        '.cm-content': {
          backgroundColor: '#282c34',
        },
        '.cm-gutters': {
          backgroundColor: '#282c34', // Match the gutter background
          borderRight: '1px solid #ffffff33', // Optional: Add a subtle border to match the app's style
        },
        '.cm-activeLine': {
          backgroundColor: '#2c313a', // Slightly lighter shade for active line
        },
        '.cm-activeLineGutter': {
          backgroundColor: '#2c313a', // Match the gutter active line
        },
      })

      const startState = EditorState.create({
        doc: this.query,
        extensions: [
          sql(),
          okaidia,
          customTheme, // Apply the custom theme after okaidia to override its styles
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newQuery = update.state.doc.toString()
              this.$emit('update:query', newQuery)
            }
          }),
        ],
      })

      this.editorView = new EditorView({
        state: startState,
        parent: this.$refs.editorContainer,
      })

      this.updateEditorHeight()
    },
    updateEditorHeight() {
      if (this.editorView) {
        const height = this.fullScreen
          ? '100vh'
          : this.showOutputTerminal
          ? 'calc(100vh - 340px)'
          : 'calc(100vh - 50px)'
        this.$refs.editorContainer.style.height = height
        this.editorView.requestMeasure()
      }
    },
  },
}
</script>

<style scoped>
.editor-wrapper {
  width: 100%;
  background-color: #282c34;
}
</style>
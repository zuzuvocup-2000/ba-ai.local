import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
  Table,
  TableToolbar,
  Indent,
  IndentBlock,
  Autoformat,
  PasteFromOffice,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'

const TOOLBAR = [
  'heading', '|',
  'bold', 'italic', 'underline', 'link', '|',
  'bulletedList', 'numberedList', '|',
  'outdent', 'indent', '|',
  'blockQuote', 'insertTable', '|',
  'undo', 'redo',
]

const PLUGINS = [
  Essentials, Paragraph, Heading, Bold, Italic, Underline, Link,
  List, BlockQuote, Table, TableToolbar, Indent, IndentBlock,
  Autoformat, PasteFromOffice,
]

export function RichEditor({ value = '', onChange, placeholder, minHeight = 200 }) {
  return (
    <div className="rich-editor" style={{ '--rich-min-h': `${minHeight}px` }}>
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={{
          licenseKey: 'GPL',
          plugins: PLUGINS,
          toolbar: TOOLBAR,
          heading: {
            options: [
              { model: 'paragraph', title: 'Đoạn văn', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Tiêu đề 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Tiêu đề 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Tiêu đề 3', class: 'ck-heading_heading3' },
            ],
          },
          table: { contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'] },
          placeholder,
        }}
        onChange={(_, editor) => onChange?.(editor.getData())}
      />
    </div>
  )
}

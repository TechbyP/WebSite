import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Paragraph from '@tiptap/extension-paragraph'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onImageUpload?: (file: File) => Promise<string>
  language: 'en' | 'de'
}

const RichTextEditor = ({ content, onChange, onImageUpload, language }: RichTextEditorProps) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Paragraph.configure({ HTMLAttributes: { class: 'rich-text-paragraph' } }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', { emitUpdate: false })
    }
  }, [content, editor])

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setIsImageModalOpen(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return

    try {
      const url = await onImageUpload(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  const setLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }

  if (!editor) return null

  const toolbarButton =
    'p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
  const activeButton = 'bg-gray-200 dark:bg-gray-700'

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-3 border-b bg-gray-50 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolbarButton} ${editor.isActive('bold') ? activeButton : ''}`}
          title={language === 'en' ? 'Bold' : 'Fett'}
        >
          <Bold className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolbarButton} ${editor.isActive('italic') ? activeButton : ''}`}
          title={language === 'en' ? 'Italic' : 'Kursiv'}
        >
          <Italic className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarButton} ${editor.isActive('bulletList') ? activeButton : ''}`}
          title={language === 'en' ? 'Bullet List' : 'Aufzählung'}
        >
          <List className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${toolbarButton} ${editor.isActive('orderedList') ? activeButton : ''}`}
          title={language === 'en' ? 'Numbered List' : 'Nummerierte Liste'}
        >
          <ListOrdered className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          type="button"
          onClick={() => setIsLinkModalOpen(true)}
          className={`${toolbarButton} ${editor.isActive('link') ? activeButton : ''}`}
          title={language === 'en' ? 'Link' : 'Verknüpfung'}
        >
          <LinkIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className={toolbarButton}
          title={language === 'en' ? 'Image' : 'Bild'}
        >
          <ImageIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className="p-6 min-h-full focus:outline-none prose dark:prose-invert max-w-none w-full h-full bg-white dark:bg-gray-900"
        />
      </div>

      {/* Footer Tip */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
        {language === 'en'
          ? 'Tip: Use the toolbar above to format your content'
          : 'Tipp: Verwenden Sie die Symbolleiste oben, um Ihren Inhalt zu formatieren'}
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'en' ? 'Insert Link' : 'Link einfügen'}
            </h3>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder={language === 'en' ? 'Enter URL' : 'URL eingeben'}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-brandblue focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg font-medium"
              >
                {language === 'en' ? 'Cancel' : 'Abbrechen'}
              </button>
              <button
                onClick={setLink}
                className="bg-brandblue hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
              >
                {language === 'en' ? 'Insert' : 'Einfügen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {language === 'en' ? 'Insert Image' : 'Bild einfügen'}
            </h3>
            <div className="mb-4">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={language === 'en' ? 'Enter image URL' : 'Bild-URL eingeben'}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brandblue focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              />
              <button
                onClick={addImage}
                className="mt-3 bg-brandblue hover:bg-blue-700 text-white w-full py-2 rounded-lg font-medium"
                disabled={!imageUrl}
              >
                {language === 'en' ? 'Insert from URL' : 'Von URL einfügen'}
              </button>
            </div>
            {onImageUpload && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {language === 'en' ? 'Or upload image' : 'Oder Bild hochladen'}
                </label>
                <label className="block w-full bg-brandblue hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center cursor-pointer font-medium">
                  {language === 'en' ? 'Select File' : 'Datei auswählen'}
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            )}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white w-full py-2 rounded-lg font-medium"
            >
              {language === 'en' ? 'Cancel' : 'Abbrechen'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor

import ReactQuill from 'react-quill-new';

const Quill = ReactQuill.Quill;

// ── Custom font sizes (pt-based) ──
const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '32pt', '36pt', '48pt'];
Quill.register(Size, true);

// Indent: use Quill's built-in class-based format (ql-indent-1 … ql-indent-8).
// CSS for these classes is in index.css — works everywhere without extra registration.

// ── Toolbar for general use (AdminGreeting, etc.) ──
export const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ size: Size.whitelist }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] as string[] }, { background: [] as string[] }],
    [{ align: [] as string[] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean'],
  ],
};

// ── Toolbar container for board editor (image + video) ──
// AdminBoard builds the full modules object with custom handlers using this.
export const QUILL_BOARD_TOOLBAR: any[] = [
  [{ header: [1, 2, 3, false] }],
  [{ size: Size.whitelist }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] as string[] }, { background: [] as string[] }],
  [{ align: [] as string[] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['link', 'image', 'video'],
  ['clean'],
];

export const QUILL_FORMATS = [
  'header', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align', 'list', 'indent',
  'link', 'image', 'video',
];

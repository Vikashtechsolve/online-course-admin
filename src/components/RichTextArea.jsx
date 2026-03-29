import { useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { Bold, Italic, List, ListOrdered, Link2, Heading1, Heading2 } from "lucide-react";

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h1", "h2", "h3", "h4", "a", "span", "div"];
const ALLOWED_ATTR = ["href", "target", "rel"];

function sanitizePastedHtml(html) {
  if (!html || typeof html !== "string") return "";
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

export default function RichTextArea({ value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const newVal = value || "";
    if (!isInternalChange.current) {
      if (el.innerHTML !== newVal) {
        el.innerHTML = newVal || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    const html = el.innerHTML;
    onChange?.({ target: { value: html } });
  };

  const handlePaste = (e) => {
    const html = e.clipboardData?.getData("text/html");
    if (html) {
      e.preventDefault();
      const cleaned = sanitizePastedHtml(html);
      document.execCommand("insertHTML", false, cleaned || e.clipboardData.getData("text/plain"));
      handleInput();
    }
  };

  const execCmd = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
  };

  const minHeight = rows * 24;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={() => execCmd("bold")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("italic")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h1")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("formatBlock", "h2")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertOrderedList")}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) execCmd("createLink", url);
          }}
          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600"
          title="Link"
        >
          <Link2 size={16} />
        </button>
        <span className="text-xs text-slate-400 ml-2">Paste from Word/Docs — formatting preserved</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="w-full px-4 py-3 text-sm border-0 focus:ring-0 focus:outline-none resize-y overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}

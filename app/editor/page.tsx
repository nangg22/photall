import { EditorLayout } from "@/components/editor/editor-layout";
import { EditorProvider } from "@/contexts/editor-context";

export default function EditorPage() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}

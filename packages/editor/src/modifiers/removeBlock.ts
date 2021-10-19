import { Modifier, EditorState, SelectionState } from 'draft-js';

/* NOT USED at the moment, but might be valuable if we want to fix atomic block behaviour */

export default function (
  editorState: EditorState,
  blockKey: string,
): EditorState {
  let content = editorState.getCurrentContent();

  const beforeKey = content.getKeyBefore(blockKey);
  const beforeBlock = content.getBlockForKey(beforeKey);
  console.log('removeBlock beforeBlock ', beforeKey);

  // 当 focusable 的 block 在 draft 开头处，删除之后保留 block ，类型 unstyled 且内容为空。
  if (beforeBlock === undefined) {
    const targetRange = new SelectionState({
      anchorKey: blockKey,
      anchorOffset: 0,
      focusKey: blockKey,
      focusOffset: 1,
      // 如果不设置 hasFocus 为 true， 可能会导致 selectionAfter 失效
      hasFocus: true,
    });
    // change the blocktype and remove the characterList entry with the sticker
    content = Modifier.removeRange(content, targetRange, 'backward');
    content = Modifier.setBlockType(content, targetRange, 'unstyled');

    return EditorState.push(editorState, content, 'remove-range');
  }

  const targetRange = new SelectionState({
    anchorKey: beforeKey,
    anchorOffset: beforeBlock.getLength(),
    focusKey: blockKey,
    focusOffset: 1,
    // 如果不设置 hasFocus 为 true， 可能会导致 selectionAfter 失效
    hasFocus: true,
  });

  content = Modifier.removeRange(content, targetRange, 'backward');

  return EditorState.push(editorState, content, 'remove-range');
}

import { ComponentType, CSSProperties, ReactNode } from 'react';
import { EditorState } from 'draft-js';
import createBlockStyleButton from './utils/createBlockStyleButton';
import { AbstractTooltipProps } from 'antd/es/tooltip';
import shouldButtonDisabled from './utils/disableStrategy';
import HeaderlineOneButton from './components/HeadlineOneButton';

export interface Locale {
  'eeeditor.button.h1.tooltip.main': string;
  'eeeditor.button.h1.tooltip.sub': string;
  'eeeditor.button.h2.tooltip.main': string;
  'eeeditor.button.h2.tooltip.sub': string;
  'eeeditor.button.h3.tooltip.main': string;
  'eeeditor.button.h3.tooltip.sub': string;
  'eeeditor.button.h4.tooltip.main': string;
  'eeeditor.button.h4.tooltip.sub': string;
  'eeeditor.button.h5.tooltip.main': string;
  'eeeditor.button.h5.tooltip.sub': string;
  'eeeditor.button.h6.tooltip.main': string;
  'eeeditor.button.h6.tooltip.sub': string;
}

export type EEEditorButtonType = 'header' | 'bold' | 'italic';

export interface EEEditorButtonProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  locale?: Locale;
  title?: {
    name?: string;
    shortcut?: string;
  };
  align?: AbstractTooltipProps['align'];
  icon?: ReactNode;
}

export interface EEEditorStyleButtonProps extends EEEditorButtonProps {
  // toolbar plugin 提供的 props
  getEditorState(): EditorState;
  setEditorState(editorState: EditorState): void;
  // 使用 static toolbar 时，selector button 提供的 props
  setSelectorBtnActive?: () => void;
  setSelectorBtnDisabled?: () => void;
  optionKey?: number;
}

export type EEEditorStyleButtonType = ComponentType<EEEditorStyleButtonProps>;

export { createBlockStyleButton, shouldButtonDisabled, HeaderlineOneButton };

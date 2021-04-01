import React, { CSSProperties, useEffect, useRef } from 'react';
import Editor from 'draft-js-plugins-editor';
import {
  EditorState,
  convertToRaw,
  ContentBlock,
  KeyBindingUtil,
  getDefaultKeyBinding,
  PluginEditorProps,
} from './';
import classNames from 'classnames';
import zhCN from './locale/zh_CN';

export interface Locale {}

export interface EEEditorProps extends PluginEditorProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  locale?: Locale;
}

const defaultBlockStyleFn = (contentBlock: ContentBlock): string => {
  const type = contentBlock.getType();
  switch (type) {
    case 'unstyled':
    case 'paragraph':
      return 'paragraph';
    case 'unordered-list-item':
      return 'unordered-list-item';
    case 'ordered-list-item':
      return 'ordered-list-item';
    case 'blockquote':
      return 'blockquote';
    case 'header-one':
      return 'header-one';
    case 'header-two':
      return 'header-two';
    case 'header-three':
      return 'header-three';
    case 'header-four':
      return 'header-four';
    case 'header-five':
      return 'header-five';
    case 'header-six':
      return 'header-six';
    case 'code-block':
      return 'code-block';
    default:
      return '';
  }
};

const defaultCustomStyleMap: PluginEditorProps['customStyleMap'] = {
  CODE: {
    display: 'inline',
    'font-size': '14px',
    margin: '0 2px',
    padding: '2px 5px',
    'border-radius': '3px',
    'background-color': 'rgb(235, 235, 235)',
    'font-family':
      'Consolas, "Liberation Mono", "BitStream Vera Sans Mono", Courier, monospace',
  },
};

const PluginEditor: React.FC<PluginEditorProps> = (props) => (
  <Editor {...props} />
);

const EEEditor: React.FC<EEEditorProps> = (props) => {
  const {
    prefixCls = 'eee',
    className,
    style,
    locale = zhCN,
    editorState,
    onChange,
    blockStyleFn = defaultBlockStyleFn,
    customStyleMap = defaultCustomStyleMap,
    ...restProps
  } = props;

  const eeeditorCls = classNames(
    prefixCls,
    {
      'eee-rtl': restProps.textDirectionality === 'RTL',
    },
    className,
  );

  // const editorRef = useRef(null);

  const handleChange = (editorState: EditorState) => {
    console.log('handleChange run -------------: ', editorState.getDecorator());
    onChange(editorState);
  };

  return (
    <div
      className={eeeditorCls}
      style={style}
      onBlur={() => {
        console.log('editor wrapper blur');
        // editorRef.current.blur();
      }}
      onFocus={() => {
        console.log('editor wrapper focus');
      }}
      onClick={() => {
        console.log('editor wrapper click');
        // editorRef.current.focus();
      }}
      onMouseDown={() => {
        console.log('editor wrapper mousedown');
      }}
      onMouseUp={() => {
        console.log('editor wrapper mouseup');
      }}
    >
      <PluginEditor
        editorState={editorState}
        onChange={handleChange}
        blockStyleFn={blockStyleFn}
        customStyleMap={customStyleMap}
        // ref={editorRef}
        {...restProps}
      />
    </div>
  );
};

export default EEEditor;

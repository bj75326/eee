import React, { useState, useEffect } from 'react';
import { connect, ConnectProps } from 'umi';
import EEEditor, { convertFromRaw, EditorState } from '@/components/eeeditor';
import { StateType } from './model';

import './index.less';

export interface PageProps extends ConnectProps {
  title: StateType['title'];
  content: StateType['content'];
}

const Page: React.FC<PageProps> = (props) => {
  const { title, content, dispatch } = props;

  const [editorState, setEditorState]: [
    EditorState,
    (editorState: EditorState) => void,
  ] = useState(
    content
      ? EditorState.createWithContent(convertFromRaw(content))
      : EditorState.createEmpty(),
  );

  const handleChange = (editorState: EditorState) => {
    setEditorState(editorState);
  };

  return (
    <div className="main">
      <header className="header"></header>
      <div className="editor">
        <div
          className="transform-wrapper"
          style={{ transform: 'translate3d(0px, 0px, 0px)' }}
        >
          <h1 className="title">
            <textarea
              maxLength={20}
              placeholder="标题"
              rows={1}
              style={{ height: '37px' }}
            ></textarea>
          </h1>
          <EEEditor editorState={editorState} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default connect(({ page }: { page: StateType }) => ({
  title: page.title,
  content: page.content,
}))(Page);

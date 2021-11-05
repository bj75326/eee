import React, { ComponentType } from 'react';
import {
  EditorPlugin,
  ContentBlock,
  EditorState,
  PluginMethods,
  focusDecorator,
  BlockFocusDecoratorProps,
} from '@eeeditor/editor';
import lang, { Languages, zhCN, Locale } from './locale';
import {
  UploadProps,
  RcFile,
  UploadFile,
  UploadChangeParam,
} from 'antd/lib/upload/interface';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import getAddImage from './modifiers/addImage';
import getUpdateImage from './modifiers/updateImage';
import { Store, createStore } from '@draft-js-plugins/utils';
import DefaultImageButton, { ImageButtonProps } from './components/ImageButton';
import DefaultImage, { ImageProps } from './components/Image';
import classNames from 'classnames';

export * from './locale';

export interface ImageEntityData {
  src?: string;
}

export interface ImagePluginMethods extends PluginMethods {
  addImage: (
    editorState: EditorState,
    data: ImageEntityData,
    file: RcFile,
  ) => EditorState;
  updateImage: (
    editorState: EditorState,
    data: ImageEntityData,
    uid: string,
  ) => EditorState;
}

export interface StoreItemMap {
  imagePluginMethods?: ImagePluginMethods;
  // entityKeyMap 用来存储 uid 与其对应的 entityKey
  entityKeyMap?: Record<string, string>;
  // fileMap 用来存储 entity 与其对应的 Rcfile
  fileMap?: Record<string, RcFile>;
  // statusMap 用来存储 uid 与其对应的 image upload status
  statusMap?: Record<string, 'uploading' | 'success' | 'error'>;
}

export type ImagePluginStore = Store<StoreItemMap>;

export type BeforeUploadValueType = void | boolean | string | Blob | File;
export type ImageUploadProps<T = any> = Pick<
  UploadProps<T>,
  'name' | 'method' | 'headers' | 'withCredentials'
> & {
  action?:
    | string
    | ((file: RcFile, imagePluginMethods: ImagePluginMethods) => string)
    | ((
        file: RcFile,
        imagePluginMethods: ImagePluginMethods,
      ) => PromiseLike<string>);
  data?:
    | object
    | ((file: UploadFile<T>, imagePluginMethods: ImagePluginMethods) => object);
  customRequest?: (
    options: RcCustomRequestOptions,
    imagePluginMethods: ImagePluginMethods,
  ) => void;
  beforeUpload?: (
    file: RcFile,
    FileList: RcFile[],
    imagePluginMethdos: ImagePluginMethods,
  ) => BeforeUploadValueType | Promise<BeforeUploadValueType>;
  onChange?: (
    info: UploadChangeParam,
    imagePluginMethods: ImagePluginMethods,
  ) => void;
  imagePath?: string[];
};

interface ImagePluginConfig {
  imageUploadProps: ImageUploadProps;
  prefixCls?: string;
  imageClassName?: string;
  entityType?: string;
  decorator?: unknown;
  focusable?: boolean;
  languages?: Languages;
}

// todo 开发使用配置 必须删除！！！
// todo 开发使用配置 必须删除！！！
// todo 开发使用配置 必须删除！！！
const getFileName = (file: RcFile): string => {
  const { name, uid } = file;
  return `${uid}.${name.split('.').pop()}`;
};
const defaultUploadProps: ImageUploadProps = {
  action: (file) =>
    `https://gitee.com/api/v5/repos/bj75326/image-bed/contents/images/${getFileName(
      file,
    )}`,
  data: (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve({
          access_token: '43ffba06ed1a8f2aa2976fc7c1e7009c',
          owner: 'bj75326',
          repo: 'image-bed',
          path: `images/${getFileName(
            file.originFileObj ? file.originFileObj : (file as RcFile),
          )}`,
          message: 'upload image',
          content: (e.target.result as string).replace(
            'data:image/png;base64,',
            '',
          ),
        });
      };
      // 异常处理省略
      reader.readAsDataURL(
        file.originFileObj ? file.originFileObj : (file as RcFile),
      );
    });
  },
  imagePath: ['content', 'download_url'],
};
// todo 开发使用配置 必须删除！！！
// todo 开发使用配置 必须删除！！！
// todo 开发使用配置 必须删除！！！

// imageUploadProps 转化为 antd UploadProps
const getUploadProps = (
  imageUploadProps: ImageUploadProps,
  store: ImagePluginStore,
  retry: boolean,
  languages: Languages,
): UploadProps => {
  const imagePluginMethods = store.getItem('imagePluginMethods');
  const {
    getEditorState,
    setEditorState,
    getProps,
    getEditorRef,
    addImage,
    updateImage,
  } = imagePluginMethods;
  const { prefixCls, locale: currLocale } = getProps();
  let locale: Locale = zhCN;
  if (currLocale && languages) {
    locale = languages[currLocale] || zhCN;
  }

  const {
    action,
    data,
    customRequest,
    beforeUpload,
    onChange,
    imagePath,
    ...otherProps
  } = imageUploadProps;

  const uploadProps: UploadProps = {
    ...otherProps,
  };
  // accept 限制上传文件类型
  uploadProps.accept = 'image/*';
  // antd upload 组件默认显示 upload list
  uploadProps.showUploadList = false;

  if (retry) {
    uploadProps.beforeUpload = async (file: RcFile, _) => {
      let transformedFile: BeforeUploadValueType = file;
      if (beforeUpload) {
        try {
          transformedFile = await beforeUpload(file, _, imagePluginMethods);
        } catch (e) {
          // Rejection will also trade as false
          transformedFile = false;
        }
      }
      return transformedFile;
    };
  } else {
    uploadProps.beforeUpload = async (file: RcFile, _) => {
      let transformedFile: BeforeUploadValueType = file;
      if (beforeUpload) {
        try {
          transformedFile = await beforeUpload(file, _, imagePluginMethods);
        } catch (e) {
          // Rejection will also trade as false
          transformedFile = false;
        }
      }
      if (transformedFile === false) return false;

      setEditorState(
        addImage(
          getEditorState(),
          {
            src: URL.createObjectURL(file),
          },
          file,
        ),
      );

      return transformedFile;
    };
  }

  uploadProps.onChange = (info: UploadChangeParam) => {
    if (onChange) {
      onChange(info, imagePluginMethods);
    }
    const statusMap = store.getItem('statusMap');
    if (info.file.status === 'done' || info.file.status === 'success') {
      // updateImage 只更新了 entity data, 所以返回的 editorState 并不会触发重新渲染
      // 对于这种 contentState 没有变化，entity data 发生变化需要同步的情况，
      // eeeditor 提供了 getEditorRef().forceSync 来帮助 app 判断是否需要强制同步
      getEditorRef().forceSync = true;

      setEditorState(
        updateImage(
          getEditorState(),
          {
            src: imagePath.reduce(
              (currentObj, path) => currentObj[path],
              info.file.response,
            ),
          },
          info.file.uid,
        ),
      );

      store.updateItem('statusMap', {
        ...statusMap,
        [info.file.uid]: 'success',
      });
    } else if (info.file.status === 'uploading') {
      console.log('onchange uploading run');
      store.updateItem('statusMap', {
        ...statusMap,
        [info.file.uid]: 'uploading',
      });
    } else if (info.file.status === 'error') {
      store.updateItem('statusMap', {
        ...statusMap,
        [info.file.uid]: 'error',
      });
    }
  };

  if (action) {
    uploadProps.action =
      typeof action === 'string'
        ? action
        : (file: RcFile) => action(file, imagePluginMethods) as string;
  }
  if (data) {
    uploadProps.data =
      typeof data === 'object'
        ? data
        : (file: UploadFile) => data(file, imagePluginMethods);
  }
  if (customRequest) {
    uploadProps.customRequest = (options: RcCustomRequestOptions) =>
      customRequest(options, imagePluginMethods);
  }

  return uploadProps as UploadProps;
};

const createImagePlugin = ({
  prefixCls,
  imageClassName,
  entityType = 'image',
  decorator,
  focusable = true,
  languages = lang,
  imageUploadProps = defaultUploadProps,
}: ImagePluginConfig): EditorPlugin & {
  ImageButton: ComponentType<ImageButtonProps>;
} => {
  const store = createStore<StoreItemMap>({
    entityKeyMap: {},
    fileMap: {},
    statusMap: {},
  });

  const addImage = getAddImage(entityType, store);
  const updateImage = getUpdateImage(store);

  let uploadProps: UploadProps = {};
  let retryUploadProps: UploadProps = {};

  const ImageButton: React.FC<ImageButtonProps> = (props) => (
    <DefaultImageButton
      {...props}
      languages={languages}
      uploadProps={uploadProps}
    />
  );

  let Image: React.FC<ImageProps> = (props) => {
    const { className: decoratorCls } = props;
    const className = classNames(decoratorCls, imageClassName);
    return (
      <DefaultImage
        {...props}
        prefixCls={prefixCls}
        languages={languages}
        uploadProps={retryUploadProps}
        store={store}
        className={className}
      />
    );
  };

  // focusable === true 则需要用 built-in/focus 提供的 decorator 包装之后再渲染
  let FocusableImage = null;
  if (focusable) {
    FocusableImage = focusDecorator(
      Image as unknown as React.FC<BlockFocusDecoratorProps>,
    );
    if (typeof decorator === 'function') {
      FocusableImage = decorator(FocusableImage);
    }
  }
  if (typeof decorator === 'function') {
    Image = decorator(Image);
  }

  const isImageBlock = (
    block: ContentBlock,
    editorState: EditorState,
  ): boolean => {
    if (block.getType() === 'atomic') {
      const contentState = editorState.getCurrentContent();
      const entity = block.getEntityAt(0);
      if (!entity) return false;
      return contentState.getEntity(entity).getType() === entityType;
    }
    return false;
  };

  return {
    initialize(pluginMethods: PluginMethods) {
      store.updateItem('imagePluginMethods', {
        ...pluginMethods,
        addImage,
        updateImage,
      });

      uploadProps = getUploadProps(imageUploadProps, store, false, languages);
      retryUploadProps = getUploadProps(
        imageUploadProps,
        store,
        true,
        languages,
      );
    },

    blockRendererFn(block, { getEditorState }) {
      if (isImageBlock(block, getEditorState())) {
        return {
          component: focusable ? FocusableImage : Image,
          editable: false,
          props: {
            focusable,
          },
        };
      }
      return null;
    },

    blockStyleFn(block, { getEditorState }) {
      if (isImageBlock(block, getEditorState())) {
        return 'picture';
      }
      return '';
    },

    ImageButton,
  };
};

export default createImagePlugin;

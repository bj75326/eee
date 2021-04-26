import React, {
  ComponentType,
  MouseEvent,
  ReactElement,
  Ref,
  useEffect,
} from 'react';
import { ContentBlock } from '../..';
import classNames from 'classnames';
import { BlockKeyStore } from './utils/createBlockKeyStore';

interface DecoratorProps {
  blockKeyStore: BlockKeyStore;
}

export interface BlockFocusDecoratorProps {
  className: string;
  blockProps: {
    isFocused: boolean;
    setFocusToBlock(): void;
  };
  block: ContentBlock;
  onMouseUp(event: MouseEvent): void;
  ref: Ref<unknown>;
  onSelect: any;
}

type WrappedComponentType = ComponentType<BlockFocusDecoratorProps> & {
  WrappedComponent?: ComponentType<BlockFocusDecoratorProps>;
};

// Get a component's display name
const getDisplayName = (WrappedComponent: WrappedComponentType): string => {
  const component = WrappedComponent.WrappedComponent || WrappedComponent;
  return component.displayName || component.name || 'Component';
};

export default ({ blockKeyStore }: DecoratorProps) => (
  WrappedComponent: WrappedComponentType,
): ComponentType<BlockFocusDecoratorProps> => {
  const BlockFocusDecorator = React.forwardRef(
    (props: BlockFocusDecoratorProps, ref): ReactElement => {
      useEffect(() => {
        blockKeyStore.add(props.block.getKey());
        return () => {
          blockKeyStore.remove(props.block.getKey());
        };
      }, []);

      const onClick = (evt: MouseEvent): void => {
        evt.preventDefault();
        if (!props.blockProps.isFocused) {
          props.blockProps.setFocusToBlock();
        }
      };

      const { blockProps, className } = props;
      const { isFocused } = blockProps;
      const combinedClassName = classNames(className, {
        isFocused: !!isFocused,
      });
      return (
        <WrappedComponent
          {...props}
          ref={ref}
          onMouseUp={onClick}
          className={combinedClassName}
          onSelect={() => {
            console.log('block select!!!!!!!!!');
          }}
        />
      );
    },
  );

  BlockFocusDecorator.displayName = `BlockFocus(${getDisplayName(
    WrappedComponent,
  )})`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (BlockFocusDecorator as any).WrappedComponent =
    WrappedComponent.WrappedComponent || WrappedComponent;

  return BlockFocusDecorator;
};

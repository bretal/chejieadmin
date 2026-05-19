import { useMemo } from 'react';
import { theme } from 'antd';
import type { ConfigProviderProps } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';

const useStyles = createStyles(({ css, cssVar }) => {
  const glassBorder = {
    boxShadow: [
      `${cssVar.boxShadowSecondary}`,
      `inset 0 0 5px 2px rgba(255, 255, 255, 0.3)`,
      `inset 0 5px 2px rgba(255, 255, 255, 0.2)`,
    ].join(','),
  };

  const glassBox = {
    ...glassBorder,
    background: `color-mix(in srgb, ${cssVar.colorBgContainer} 15%, transparent)`,
    backdropFilter: 'blur(12px)',
  };

  const glassHoverRing = '0 0 0 2px rgba(64, 150, 255, 1)';
  const glassSelectHoverRing = '0 0 0 2px rgba(64, 150, 255, 1)';
  const glassControlInset = 'inset 0 0 4px 1px rgba(255, 255, 255, 0.22)';
  const glassSelectInset =
    'inset 0 0 0 1px rgba(255, 255, 255, 0.42), inset 0 1px 2px rgba(255, 255, 255, 0.28)';

  const glassControlSurface = {
    backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 22%, transparent) !important`,
    borderColor: `color-mix(in srgb, ${cssVar.colorBorder} 38%, transparent) !important`,
    boxShadow: `${glassControlInset}, ${cssVar.boxShadowSecondary}`,
    backdropFilter: 'none',
  };

  return {
    glassBorder,
    glassBox,
    notBackdropFilter: css({
      backdropFilter: 'none',
    }),
    app: css({
      textShadow: '0 1px rgba(0,0,0,0.1)',
    }),
    cardRoot: css({
      ...glassBox,
      backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 40%, transparent)`,
    }),
    modalContainer: css({
      ...glassBox,
      backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 28%, transparent) !important`,
      border: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 38%, transparent) !important`,
      WebkitBackdropFilter: 'blur(18px) saturate(130%)',
      backdropFilter: 'blur(18px) saturate(130%)',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: 'min(90dvh, 900px)',
      overflow: 'hidden',
    }),
    modalHeader: css({
      background: 'transparent !important',
      borderBottom: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 28%, transparent) !important`,
      flex: '0 0 auto',
    }),
    modalBody: css({
      background: 'transparent !important',
      flex: '1 1 auto',
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      WebkitOverflowScrolling: 'touch',
      scrollbarGutter: 'stable',
      paddingInline: 4,
    }),
    modalFooter: css({
      background: 'transparent !important',
      borderTop: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 28%, transparent) !important`,
      flex: '0 0 auto',
    }),
    buttonRoot: css({
      ...glassBorder,
    }),
    buttonRootDefaultColor: css({
      background: 'transparent',
      color: cssVar.colorText,

      '&:hover': {
        background: 'rgba(255,255,255,0.2)',
        color: `color-mix(in srgb, ${cssVar.colorText} 90%, transparent)`,
      },

      '&:active': {
        background: 'rgba(255,255,255,0.1)',
        color: `color-mix(in srgb, ${cssVar.colorText} 80%, transparent)`,
      },
    }),
    dropdownRoot: css({
      ...glassBox,
      borderRadius: cssVar.borderRadiusLG,

      ul: {
        background: 'transparent',
      },
    }),
    switchRoot: css({ ...glassBorder, border: 'none' }),
    tableRoot: css({
      ...glassBox,
      backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 32%, transparent)`,
      borderRadius: cssVar.borderRadiusLG,
      overflow: 'hidden',
    }),
    tableContent: css({
      background: 'transparent !important',

      '.ant-table': {
        background: 'transparent',
      },
      '.ant-table-container': {
        background: 'transparent',
      },
      '.ant-table-thead > tr > th': {
        background: `color-mix(in srgb, ${cssVar.colorBgContainer} 24%, transparent) !important`,
        borderBottom: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 38%, transparent)`,
      },
      '.ant-table-tbody > tr > td': {
        background: 'transparent',
        borderBottom: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 24%, transparent)`,
      },
      '.ant-table-tbody > tr:hover > td': {
        background: 'rgba(255, 255, 255, 0.2) !important',
      },
      '.ant-table-tbody > tr.ant-table-row-selected > td': {
        background: `color-mix(in srgb, ${cssVar.colorPrimary} 14%, transparent) !important`,
      },
    }),
    tablePagination: css({
      '.ant-pagination-item, .ant-pagination-prev, .ant-pagination-next': {
        ...glassBorder,
        background: 'transparent',
      },
      '.ant-pagination-item-active': {
        ...glassBox,
        backdropFilter: 'none',
      },
    }),
    menuRoot: css({
      background: 'transparent !important',
      borderInlineEnd: 'none !important',
    }),
    menuItem: css({
      borderRadius: cssVar.borderRadius,
      marginBlock: 4,

      '&:hover': {
        background: 'rgba(255, 255, 255, 0.22) !important',
      },

      '&.ant-menu-item-selected': {
        ...glassBox,
        backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 38%, transparent) !important`,
        color: cssVar.colorText,
        fontWeight: 500,
      },
    }),
    alertRoot: css({
      ...glassBox,
      backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 30%, transparent)`,
      border: `1px solid color-mix(in srgb, ${cssVar.colorBorder} 32%, transparent)`,
    }),
    glassControl: css({
      ...glassControlSurface,

      '&:hover:not(.ant-input-disabled):not(.ant-input-number-disabled):not([disabled])': {
        backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 28%, transparent) !important`,
        borderColor: `color-mix(in srgb, ${cssVar.colorBorder} 45%, transparent) !important`,
        boxShadow: `${glassControlInset}, ${glassHoverRing} !important`,
      },

      '&:focus, &:focus-within': {
        backgroundColor: `color-mix(in srgb, ${cssVar.colorBgContainer} 32%, transparent) !important`,
        borderColor: `color-mix(in srgb, ${cssVar.colorPrimary} 55%, transparent) !important`,
        boxShadow: `${glassControlInset}, ${glassHoverRing} !important`,
      },
    }),
    glassSelect: css({
      /* Ant Design 6：默认态参考玻璃下拉（无蓝色外圈） */
      '&.ant-select-outlined': {
        '--ant-select-background-color': 'color-mix(in srgb, #ffffff 40%, transparent)',
        '--ant-select-border-color': 'rgba(255, 255, 255, 0.55)',
        backgroundColor: 'color-mix(in srgb, #ffffff 40%, transparent) !important',
        borderColor: 'rgba(255, 255, 255, 0.55) !important',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: `${glassSelectInset} !important`,
      },

      '&.ant-select-outlined:hover:not(.ant-select-disabled)': {
        '--ant-select-background-color': 'color-mix(in srgb, #ffffff 48%, transparent)',
        '--ant-select-border-color': 'rgba(255, 255, 255, 0.62)',
        backgroundColor: 'color-mix(in srgb, #ffffff 48%, transparent) !important',
        boxShadow: `${glassSelectHoverRing} !important`,
      },

      '&.ant-select-outlined.ant-select-focused:not(.ant-select-disabled), &.ant-select-outlined.ant-select-open:not(.ant-select-disabled)':
        {
          '--ant-select-background-color': 'color-mix(in srgb, #ffffff 48%, transparent)',
          '--ant-select-border-color': 'rgba(255, 255, 255, 0.62)',
          boxShadow: `${glassSelectInset} !important`,
        },

      '& .ant-select-suffix': {
        borderInlineStart: '1px solid rgba(255, 255, 255, 0.38)',
        paddingInlineStart: 10,
        marginInlineStart: 6,
      },

      /* 多选 / 旧版 DOM */
      '& .ant-select-selector': {
        backgroundColor: 'color-mix(in srgb, #ffffff 40%, transparent) !important',
        borderColor: 'rgba(255, 255, 255, 0.55) !important',
        backdropFilter: 'blur(14px)',
        boxShadow: `${glassSelectInset} !important`,
        borderRadius: cssVar.borderRadius,
      },

      '&:hover:not(.ant-select-disabled) .ant-select-selector': {
        backgroundColor: 'color-mix(in srgb, #ffffff 48%, transparent) !important',
        borderColor: 'rgba(255, 255, 255, 0.62) !important',
        boxShadow: `${glassSelectHoverRing} !important`,
      },

      '&.ant-select-focused .ant-select-selector, &.ant-select-open .ant-select-selector': {
        backgroundColor: 'color-mix(in srgb, #ffffff 48%, transparent) !important',
        borderColor: 'rgba(255, 255, 255, 0.62) !important',
        boxShadow: `${glassSelectInset} !important`,
      },
    }),
    formControlContent: css({
      width: '100%',

      '& > .ant-input-affix-wrapper, & > .ant-input, & > .ant-input-number, & > .ant-select': {
        width: '100%',
      },
    }),
  };
});

const useGlassTheme = () => {
  const { styles } = useStyles();

  return useMemo<ConfigProviderProps>(
    () => ({
      theme: {
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 12,
          borderRadiusLG: 12,
          borderRadiusSM: 12,
          borderRadiusXS: 12,
          motionDurationSlow: '0.2s',
          motionDurationMid: '0.1s',
          motionDurationFast: '0.05s',
        },
        components: {
          Table: {
            headerBg: 'transparent',
            rowHoverBg: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.28)',
            headerSplitColor: 'rgba(255, 255, 255, 0.22)',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: 'transparent',
            itemHoverBg: 'rgba(255, 255, 255, 0.22)',
            subMenuItemBg: 'transparent',
          },
          Modal: {
            contentBg: 'transparent',
            headerBg: 'transparent',
            footerBg: 'transparent',
          },
          Input: {
            colorBgContainer: 'transparent',
            hoverBg: 'rgba(255, 255, 255, 0.24)',
            activeBg: 'rgba(255, 255, 255, 0.3)',
          },
          InputNumber: {
            colorBgContainer: 'transparent',
            hoverBg: 'rgba(255, 255, 255, 0.24)',
            activeBg: 'rgba(255, 255, 255, 0.3)',
          },
          Select: {
            colorBgContainer: 'transparent',
            selectorBg: 'transparent',
            hoverBorderColor: 'rgba(64, 150, 255, 1)',
            activeBorderColor: 'rgba(255, 255, 255, 0.62)',
            activeOutlineColor: 'transparent',
            optionActiveBg: 'rgba(255, 255, 255, 0.28)',
            optionSelectedBg: 'rgba(255, 255, 255, 0.34)',
          },
        },
      },
      form: {
        classNames: {
          content: styles.formControlContent,
        },
      },
      app: {
        className: styles.app,
      },
      card: {
        classNames: {
          root: styles.cardRoot,
        },
      },
      modal: {
        centered: true,
        classNames: {
          container: styles.modalContainer,
          header: styles.modalHeader,
          body: styles.modalBody,
          footer: styles.modalFooter,
        },
        styles: {
          wrapper: {
            overflow: 'auto',
            padding: '24px 16px',
          },
          container: {
            maxHeight: 'min(90dvh, 900px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
          body: {
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            scrollbarGutter: 'stable',
          },
        },
      },
      button: {
        classNames: ({ props }) => ({
          root: clsx(
            styles.buttonRoot,
            (props.variant !== 'solid' || props.color === 'default' || props.type === 'default') &&
              styles.buttonRootDefaultColor,
          ),
        }),
      },
      alert: {
        classNames: {
          root: clsx(styles.alertRoot, styles.notBackdropFilter),
        },
      },
      table: {
        classNames: {
          root: styles.tableRoot,
          content: styles.tableContent,
          pagination: {
            root: styles.tablePagination,
          },
        },
      },
      menu: {
        classNames: {
          root: styles.menuRoot,
          item: styles.menuItem,
        },
      },
      input: {
        classNames: {
          root: styles.glassControl,
          variant: styles.glassControl,
          affixWrapper: styles.glassControl,
        },
      },
      inputNumber: {
        classNames: {
          root: styles.glassControl,
          variant: styles.glassControl,
        },
      },
      textArea: {
        classNames: {
          root: styles.glassControl,
          variant: styles.glassControl,
          affixWrapper: styles.glassControl,
          textarea: styles.glassControl,
        },
      },
      colorPicker: {
        arrow: false,
      },
      dropdown: {
        classNames: {
          root: styles.dropdownRoot,
        },
      },
      select: {
        classNames: {
          root: styles.glassSelect,
          popup: {
            root: styles.glassBox,
          },
        },
      },
      popover: {
        classNames: {
          container: styles.glassBox,
        },
      },
      switch: {
        classNames: {
          root: styles.switchRoot,
        },
      },
      progress: {
        classNames: {
          track: styles.glassBorder,
        },
        styles: {
          track: {
            height: 12,
          },
          rail: {
            height: 12,
          },
        },
      },
    }),
    [styles],
  );
};

export default useGlassTheme;

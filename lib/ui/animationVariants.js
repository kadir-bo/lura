/**
 * Animation variants for the container
 */
export const getContainerVariant = (textAreaGrowHeight) => ({
  initial: {
    height: "auto",
  },
  animate: {
    height: textAreaGrowHeight,
  },
});

/**
 * Animation variants for the textarea
 */
export const getTextAreaVariant = (buttonContainerHeight) => ({
  initial: {
    position: "relative",
  },
  animate: {
    position: "absolute",
    left: 8,
    top: 8,
    right: 8,
    bottom: buttonContainerHeight + 8,
  },
});

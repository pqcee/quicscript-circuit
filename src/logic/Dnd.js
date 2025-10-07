import { useRef, useState } from "react";
import { useEffect } from "react";
import { modeColors } from "../components/builder/Selector";
import { useDragDropContext } from "../contexts/DragDropContext";

function elementReset(e) {
  e.style.position = "relative";
  e.style.left = "0px";
  e.style.top = "0px";
}

export const TOUCH = "Touch";

/**
 * For drag components
 * @param {Function} whenDrop Trigger when drop
 * @param {Function} whenDelete Trigger when delete
 * @param {Function} whenDrag Trigger when drag
 * @param {Function} getLocation Get location when dragging drag and drop
 * @param {String} type Type of item being dragged
 * @returns
 */
export function useDrag(whenDrop, whenDelete, whenDrag, getLocation, mode) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Get access to the global context
  const { dispatch } = useDragDropContext();

  const activePointerRef = useRef(null); // Track the active pointer
  const cloneRef = useRef(null); // Track the cloned element
  const draggedElementRef = useRef(null); // Track the dragged element

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    // Critical styles for touch compatibility
    ele.style.touchAction = "none";
    ele.style.webkitUserSelect = "none";
    ele.style.userSelect = "none";

    // Windows-specific: Prevent context menu on long press
    ele.style.webkitTouchCallout = "none";

    // Prevent IE/Edge default behaviors
    ele.style.msUserSelect = "none";
    ele.style.msTouchAction = "none";

    // Mark as draggable for getParent function
    ele.dataset.draggable = "true";

    // Prevent context menu on Windows touch devices
    ele.addEventListener("contextmenu", (e) => {
      if (isDragging) {
        e.preventDefault();
        return false;
      }
    });

    function getParent(target) {
      let parent = target;
      let maxRecursion = 10;

      while (parent && maxRecursion > 0) {
        if (parent.dataset?.noDrag) return null;
        if (parent === ele || parent.dataset?.draggable === "true") {
          return parent;
        }
        parent = parent.parentElement;
        maxRecursion--;
      }

      return null;
    }

    function moveTarget(e, target) {
      if (target instanceof HTMLElement) {
        const offset = 25;

        // Use pageX/pageY for better cross-platform compatibility
        const x = e.clientX || e.pageX;
        const y = e.clientY || e.pageY;

        target.style.position = "fixed";
        target.style.left = Math.floor(x - offset) + "px";
        target.style.top = Math.floor(y - offset) + "px";
        target.style.zIndex = "9999";
        target.style.pointerEvents = "none";

        if (mode && !target.dataset?.update) {
          const color =
            modeColors[mode].substring(0, modeColors[mode].length - 2) + "0.4)";
          for (const { children } of target.children) {
            for (const t of children) {
              for (const c of t.children) {
                c.style.backgroundColor = color;
              }
            }
          }
          target.dataset.update = true;
        }

        if (whenDrag) {
          const targetElement = document
            .elementsFromPoint(x, y)
            .find(
              (element) =>
                element instanceof HTMLElement &&
                element.dataset.droppable === "true"
            );

          if (targetElement) {
            const dropX = parseInt(targetElement.dataset.x);
            const dropY = parseInt(targetElement.dataset.y);

            whenDrag(dropX, dropY, TOUCH);

            // Notify global context of drop target
            dispatch({
              type: "DRAG_OVER",
              payload: {
                target: targetElement,
                position: { x: dropX, y: dropY },
              },
            });
          } else {
            whenDrag();

            // Clear drop target in global context
            dispatch({
              type: "DRAG_OVER",
              payload: {
                target: null,
                position: null,
              },
            });
          }
        }
      }
    }

    // Check for touch support more reliably
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 || // For older Windows devices
      (window.PointerEvent && "maxTouchPoints" in navigator);

    // Only use drag API for pure mouse devices
    if (!isTouchDevice) {
      ele.draggable = true;

      // Integrate with context during drag start
      dispatch({
        type: "DRAG_START",
        payload: {
          item: draggedElementRef.current || ele,
          type: mode || "unknown",
        },
      });

      ele.ondragstart = (e) => {
        setIsDragging(true);
        if (whenDrag) {
          if (getLocation) {
            const target = document
              .elementsFromPoint(e.clientX, e.clientY)
              .find(
                (element) =>
                  element instanceof HTMLElement &&
                  element.dataset.droppable === "true"
              );
            if (target) {
              whenDrag(target.dataset.x, target.dataset.y);
            } else {
              whenDrag();
            }
          } else {
            whenDrag();
          }
        }
      };

      ele.ondragend = () => {
        setIsDragging(false);

        // Notify global context that drag has ended
        dispatch({ type: "DRAG_END" });
      };
    } else {
      // Explicitly disable draggable for touch devices
      ele.draggable = false;
    }

    const handlePointerDown = (e) => {
      const parent = getParent(e.target);
      if (!parent) {
        return;
      }

      // Prevent defaults for touch
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        e.preventDefault();
        e.stopPropagation();
      }

      // Only handle primary pointer for touch (first finger)
      // This prevents multi-touch issues on Windows
      if (e.pointerType === "touch" && !e.isPrimary) {
        return;
      }

      activePointerRef.current = e.pointerId;
      draggedElementRef.current = parent;

      // Set pointer capture
      try {
        parent.setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn("Could not capture pointer:", err);
      }

      setIsDragging(true);

      // Context integration for pointer-based drag start
      dispatch({
        type: "DRAG_START",
        payload: {
          item: parent,
          type: mode || "unknown",
        },
      });

      cloneRef.current = parent.cloneNode(true);
      elementReset(cloneRef.current);
      cloneRef.current.style.opacity = 0.5;
      cloneRef.current.style.pointerEvents = "none";
      cloneRef.current.style.touchAction = "none";
      cloneRef.current.style.userSelect = "none";

      parent.insertAdjacentElement("afterend", cloneRef.current);

      moveTarget(e, parent);
    };

    const handlePointerMove = (e) => {
      if (activePointerRef.current !== e.pointerId) return;
      if (!draggedElementRef.current || !cloneRef.current) return;

      // Prevent scrolling on Windows touch
      if (e.pointerType === "touch" || e.pointerType === "pen") {
        e.preventDefault();
        e.stopPropagation();
      }

      moveTarget(e, draggedElementRef.current);
    };

    const handlePointerUp = (e) => {
      if (activePointerRef.current !== e.pointerId) return;
      if (!cloneRef.current || !draggedElementRef.current) return;

      try {
        if (draggedElementRef.current.hasPointerCapture(e.pointerId)) {
          draggedElementRef.current.releasePointerCapture(e.pointerId);
        }
      } catch (err) {
        console.warn("Could not release pointer:", err);
      }

      setIsDragging(false);

      // Hide dragged element to find drop target
      const originalPointerEvents =
        draggedElementRef.current.style.pointerEvents;
      draggedElementRef.current.style.pointerEvents = "none";

      const x = e.clientX || e.pageX;
      const y = e.clientY || e.pageY;

      const target = document
        .elementsFromPoint(x, y)
        .find(
          (element) =>
            element instanceof HTMLElement &&
            element.dataset.droppable === "true"
        );

      draggedElementRef.current.style.pointerEvents = originalPointerEvents;

      if (target) {
        if (target.dataset.bin === "true") {
          whenDelete();

          // Notify context of deletion
          dispatch({
            type: "DRAG_END",
            payload: { result: "deleted" },
          });
        } else {
          const qubit = parseInt(target.dataset.x);
          const column = parseInt(target.dataset.y);
          whenDrop(qubit, column);

          // Notify context of successful drop
          dispatch({
            type: "DRAG_END",
            payload: {
              result: "dropped",
              position: { x: qubit, y: column },
            },
          });
        }
      } else {
        // Drag ended without a valid drop target
        dispatch({
          type: "DRAG_END",
          payload: { result: "cancelled" },
        });
      }

      cloneRef.current.remove();
      cloneRef.current = null;

      elementReset(draggedElementRef.current);
      draggedElementRef.current.style.zIndex = "";
      draggedElementRef.current.style.pointerEvents = "";

      activePointerRef.current = null;
      draggedElementRef.current = null;

      if (whenDrag && getLocation) whenDrag();
    };

    const handlePointerCancel = (e) => {
      if (activePointerRef.current !== e.pointerId) return;

      if (cloneRef.current) {
        cloneRef.current.remove();
        cloneRef.current = null;
      }

      if (draggedElementRef.current) {
        try {
          if (draggedElementRef.current.hasPointerCapture(e.pointerId)) {
            draggedElementRef.current.releasePointerCapture(e.pointerId);
          }
        } catch (err) {
          console.warn("Could not release pointer:", err);
        }

        elementReset(draggedElementRef.current);
        draggedElementRef.current.style.zIndex = "";
        draggedElementRef.current.style.pointerEvents = "";
        draggedElementRef.current = null;
      }

      setIsDragging(false);
      activePointerRef.current = null;

      // Notify context that drag was cancelled
      dispatch({
        type: "DRAG_END",
        payload: { result: "cancelled" },
      });
    };

    // Use passive: false for touch events to ensure preventDefault works
    ele.addEventListener("pointerdown", handlePointerDown, { passive: false });
    ele.addEventListener("pointermove", handlePointerMove, { passive: false });
    ele.addEventListener("pointerup", handlePointerUp, { passive: false });
    ele.addEventListener("pointercancel", handlePointerCancel, {
      passive: false,
    });

    // Cleanup
    return () => {
      ele.ondragstart = null;
      ele.ondragend = null;
      ele.removeEventListener("pointerdown", handlePointerDown);
      ele.removeEventListener("pointermove", handlePointerMove);
      ele.removeEventListener("pointerup", handlePointerUp);
      ele.removeEventListener("pointercancel", handlePointerCancel);

      ele.style.touchAction = "";
      ele.style.webkitUserSelect = "";
      ele.style.userSelect = "";
      ele.style.msUserSelect = "";
      ele.style.msTouchAction = "";
      ele.style.webkitTouchCallout = "";
      ele.style.cursor = "";
      ele.dataset.draggable = null;
    };
  }, []);

  return [{ isDragging }, ref];
}

export function useDrop(whenDrop, column, setOverColumn) {
  /**
   * Ref to be used in drop components
   * @type {{current: HTMLElement}}
   */
  const ref = useRef(null);

  useEffect(() => {
    /** @type {HTMLElement} */
    const ele = ref.current;

    ele.ondragenter = () => {
      if (setOverColumn) setOverColumn(column);
    };

    ele.ondragleave = () => {
      if (setOverColumn) setOverColumn(-2);
    };

    ele.ondrop = () => {
      whenDrop();
      if (setOverColumn) setOverColumn(-2);
    };

    ele.dataset.droppable = true;
    ele.ondragover = () => false;
  }, []);

  return ref;
}

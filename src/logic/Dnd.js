import { useRef, useState } from "react";
import { useEffect } from "react";
import { modeColors } from "../components/Selector";

function elementReset(e) {
  e.style.position = "relative";
  e.style.left = "0px";
  e.style.top = "0px";
}

function getParent(target) {
  let parent = target;
  let maxRecursion = 10;
  while (!parent.draggable && !parent.dataset?.noDrag && maxRecursion > 0) {
    parent = parent.parentElement;
    maxRecursion--;
  }
  if (parent.dataset?.noDrag) return;
  if (maxRecursion == 0) return;
  return parent;
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
  /**
   * Ref to be used in drag components
   * @type {{current: HTMLElement}}
   */
  const ref = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  let clone = null;

  useEffect(() => {
    function moveTarget(e, target) {
      /** Moving Element */
      if (target instanceof HTMLElement) {
        if (e instanceof TouchEvent) {
          let touchLocation = e.targetTouches[0];
          const offset = 25;
          let pageX = Math.floor(touchLocation.clientX - offset) + "px";
          let pageY = Math.floor(touchLocation.clientY - offset) + "px";
          target.style.position = "fixed";
          target.style.left = pageX;
          target.style.top = pageY;

          if (!!mode) {
            if (!target.dataset) target.dataset = {};
            if (!target.dataset.update) {
              const color =
                modeColors[mode].substring(0, modeColors[mode].length - 2) +
                "0.4)";
              for (const { children } of target.children) {
                for (const t of children) {
                  for (const c of t.children) {
                    c.style.backgroundColor = color;
                  }
                }
              }
              target.dataset.update = true;
            }
          }

          if (!!whenDrag && getLocation) {
            const target = document
              .elementsFromPoint(touchLocation.clientX, touchLocation.clientY)
              .filter((element) =>
                element instanceof HTMLElement &&
                element.dataset.droppable == "true"
                  ? true
                  : false
              )
              .shift();
            if (target != undefined) {
              whenDrag(
                parseInt(target.dataset.x),
                parseInt(target.dataset.y),
                TOUCH
              );
            } else whenDrag();
          }
        }
      }
    }

    /** @type {HTMLElement} */
    const ele = ref.current;
    ele.draggable = true;

    /** ondragstart */
    ele.ondragstart = (e) => {
      setIsDragging(true);
      if (whenDrag) {
        if (getLocation) {
          const target = document
            .elementsFromPoint(e.clientX, e.clientY)
            .filter((element) =>
              element instanceof HTMLElement &&
              element.dataset.droppable == "true"
                ? true
                : false
            )
            .shift();
          if (target != undefined) whenDrag(target.dataset.x, target.dataset.y);
          else whenDrag();
        } else whenDrag();
      }
    };

    /** ondragend */
    ele.ondragend = () => {
      setIsDragging(false);
    };

    /** ontouchstart */
    ele.ontouchstart = (e) => {
      /** Seek for parent with draggable */
      let parent = getParent(e.target);
      if (parent == undefined) return;

      setIsDragging(true);

      clone = parent.cloneNode(true);
      elementReset(clone);
      clone.style.opacity = 0.5;
      parent.insertAdjacentElement("afterend", clone);

      moveTarget(e, parent);
    };

    /** ontouchmove */
    ele.ontouchmove = (e) => {
      e.preventDefault();

      let parent = getParent(e.target);
      if (parent == undefined) return;

      moveTarget(e, parent);
    };

    /** ontouchend */
    ele.ontouchend = (e) => {
      if (!clone) return;

      /** Seek for parent with draggable */
      let parent = getParent(e.target);
      if (parent == undefined) return;

      setIsDragging(false);
      clone.style.opacity = 1;

      const target = document
        .elementsFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        )
        .filter((element) =>
          element instanceof HTMLElement && element.dataset.droppable == "true"
            ? true
            : false
        )
        .shift();

      if (target != undefined) {
        if (target.dataset.bin == "true") whenDelete();
        else {
          const qubit = parseInt(target.dataset.x);
          const column = parseInt(target.dataset.y);
          whenDrop(qubit, column);
        }
      }

      clone.remove();

      elementReset(parent);

      if (whenDrag && getLocation) whenDrag();
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

  const [isOver, setIsOver] = useState(false);

  useEffect(() => {
    /** @type {HTMLElement} */
    const ele = ref.current;

    ele.ondragenter = () => {
      setIsOver(true);
      if (setOverColumn) setOverColumn(column);
    };

    ele.ondragleave = () => {
      setIsOver(false);
      if (setOverColumn) setOverColumn(-2);
    };

    ele.ondrop = () => {
      whenDrop();
      if (setOverColumn) setOverColumn(-2);
    };

    ele.dataset.droppable = true;
    ele.ondragover = () => false;
  }, []);

  return [{ isOver }, ref];
}

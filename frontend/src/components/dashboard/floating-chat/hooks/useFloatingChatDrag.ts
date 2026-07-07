"use client";

import React, { useState, useRef } from "react";

export function useFloatingChatDrag(
  buttonRef: React.RefObject<HTMLButtonElement | null>,
  chatRef: React.RefObject<HTMLDivElement | null>,
) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const isDraggingRef = useRef(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    buttonX: number;
    buttonY: number;
    lastX: number;
    lastY: number;
  } | null>(null);

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragRef.current) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDraggingRef.current = true;

    const x = Math.max(
      8,
      Math.min(dragRef.current.buttonX + dx, window.innerWidth - 64),
    );
    const y = Math.max(
      8,
      Math.min(dragRef.current.buttonY + dy, window.innerHeight - 64),
    );
    dragRef.current.lastX = x;
    dragRef.current.lastY = y;

    requestAnimationFrame(() => {
      if (!dragRef.current || !buttonRef.current) return;
      buttonRef.current.style.left = `${x}px`;
      buttonRef.current.style.top = `${y}px`;
      buttonRef.current.style.bottom = buttonRef.current.style.right = "auto";

      if (chatRef.current) {
        const w = window.innerWidth < 640 ? 340 : 400;
        let top = Math.max(8, y - 512);
        if (top < 8) top = y + 76;
        chatRef.current.style.left = `${Math.max(12, Math.min(x + 28 - w / 2, window.innerWidth - w - 12))}px`;
        chatRef.current.style.top = `${top}px`;
        chatRef.current.style.bottom = chatRef.current.style.right = "auto";
      }
    });
  };

  const startDrag = (
    clientX: number,
    clientY: number,
    button: HTMLButtonElement,
  ) => {
    const rect = button.getBoundingClientRect();
    button.style.transition = "none";
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      buttonX: rect.left,
      buttonY: rect.top,
      lastX: rect.left,
      lastY: rect.top,
    };
    isDraggingRef.current = false;
  };

  const endDrag = () => {
    if (buttonRef.current) buttonRef.current.style.transition = "";
    if (dragRef.current)
      setPosition({ x: dragRef.current.lastX, y: dragRef.current.lastY });
    setTimeout(() => {
      dragRef.current = null;
      isDraggingRef.current = false;
    }, 50);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY, e.currentTarget);
    const onMouseMove = (me: MouseEvent) =>
      handleDragMove(me.clientX, me.clientY);
    const onMouseUp = () => {
      endDrag();
      document.removeEventListener("mousemove", onMouseMove);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY, e.currentTarget);
    const onTouchMove = (te: TouchEvent) =>
      handleDragMove(te.touches[0].clientX, te.touches[0].clientY);
    const onTouchEnd = () => {
      endDrag();
      document.removeEventListener("touchmove", onTouchMove);
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { once: true });
  };

  return { position, isDraggingRef, handleMouseDown, handleTouchStart };
}

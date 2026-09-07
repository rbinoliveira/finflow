'use client'

import { type ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/utils/cn.util'

type DialogProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-end justify-center p-5 sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        className="bg-base/80 absolute inset-0 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'border-line bg-card max-w-app relative w-full rounded-2xl border px-5 py-5',
          className,
        )}
      >
        <h2 id={titleId} className="text-ink text-lg font-semibold">
          {title}
        </h2>

        {description && (
          <p
            id={descriptionId}
            className="text-ink-muted mt-2 text-sm leading-[1.6]"
          >
            {description}
          </p>
        )}

        {children}
      </div>
    </div>,
    document.body,
  )
}

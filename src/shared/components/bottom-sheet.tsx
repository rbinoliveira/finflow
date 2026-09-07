'use client'

import { type ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/shared/utils/cn.util'

type BottomSheetProps = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  className?: string
}

export function BottomSheet({
  open,
  title,
  description,
  onClose,
  children,
  className,
}: BottomSheetProps) {
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
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-5">
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
          'border-line bg-card max-w-app safe-bottom relative max-h-[92dvh] w-full',
          'overflow-y-auto rounded-t-3xl border px-5 pt-4 sm:rounded-3xl sm:pb-5',
          className,
        )}
      >
        <div
          aria-hidden
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/12 sm:hidden"
        />

        <div className="mb-4 flex flex-col gap-1">
          <h2 id={titleId} className="text-ink text-lg font-semibold">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-ink-muted text-sm">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>,
    document.body,
  )
}

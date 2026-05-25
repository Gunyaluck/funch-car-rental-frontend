import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function AdminDataTableContainer({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[28px] border border-black/8 bg-white/75 shadow-[0_18px_50px_rgba(32,48,36,0.08)]',
        className,
      )}
      {...props}
    />
  )
}

export function AdminDataTable({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full border-collapse text-sm', className)} {...props} />
}

export function AdminDataTableHead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-black/[0.03]', className)} {...props} />
}

export function AdminDataTableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-b-0', className)} {...props} />
}

export function AdminDataTableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-black/8 align-top transition-colors hover:bg-black/[0.025]',
        className,
      )}
      {...props}
    />
  )
}

export function AdminDataTableHeaderCell({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.08em] text-stone-500',
        className,
      )}
      {...props}
    />
  )
}

export function AdminDataTableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-4 text-stone-700', className)} {...props} />
}

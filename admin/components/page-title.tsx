interface PageTitleProps {
  title: string
}

export default function PageTitle({ title }: PageTitleProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  )
}

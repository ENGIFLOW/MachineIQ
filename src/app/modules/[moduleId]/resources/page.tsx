import { notFound } from 'next/navigation'
import { getModuleById } from '@/lib/database/queries'
import { ModuleResources } from '@/components/resources/ModuleResources'

interface PageProps {
  params: Promise<{
    moduleId: string
  }>
}

export default async function ModuleResourcesPage({ params }: PageProps) {
  const { moduleId } = await params

  const module = await getModuleById(moduleId)

  if (!module) {
    notFound()
  }

  const moduleTitle = module.title_en || module.title_vi || 'Module Resources'

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ModuleResources moduleId={moduleId} moduleTitle={moduleTitle} />
    </div>
  )
}

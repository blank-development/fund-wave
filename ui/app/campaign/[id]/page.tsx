import ProjectPage from "@/components/project-page"

export default function Project({ params }: { params: { id: string } }) {
  return <ProjectPage id={params.id} />
}

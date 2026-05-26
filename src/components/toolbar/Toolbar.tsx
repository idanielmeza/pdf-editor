import FileActions from './FileActions'
import EditActions from './EditActions'
import PageActions from './PageActions'
import ZoomControl from './ZoomControl'

export default function Toolbar() {
  return (
    <div className="toolbar">
      <FileActions />
      <EditActions />
      <PageActions />
      <ZoomControl />
    </div>
  )
}

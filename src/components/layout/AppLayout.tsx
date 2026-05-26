import Header from './Header'
import ThumbnailSidebar from '../sidebar/ThumbnailSidebar'
import EditorArea from '../editor/EditorArea'
import PropertiesPanel from '../panels/PropertiesPanel'
import PageNav from '../ui/PageNav'

export default function AppLayout() {
  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <ThumbnailSidebar />
        <EditorArea />
        <PropertiesPanel />
      </div>
      <PageNav />
    </div>
  )
}

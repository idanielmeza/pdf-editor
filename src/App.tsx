import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import AppLayout from './components/layout/AppLayout'
import OcrOverlay from './components/ui/OcrOverlay'
import ToastContainer from './components/ui/ToastContainer'

export default function App() {
  useKeyboardShortcuts()
  return (
    <>
      <AppLayout />
      <OcrOverlay />
      <ToastContainer />
    </>
  )
}

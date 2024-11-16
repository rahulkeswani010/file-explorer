import { FileExplorer } from './components/FileExplorer';
import { filesData } from './data/data';
import './App.css';

function App() {
  return (
    <div className="App">
      <FileExplorer data={filesData} />
    </div>
  );
}

export default App;

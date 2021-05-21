import logo from "./logo.svg";
import "./App.css";
import { SearchBar } from "./SearchBar";

function App() {
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <SearchBar />
    </div>
  );
}

export default App;

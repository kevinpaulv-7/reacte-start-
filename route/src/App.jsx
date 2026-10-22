import { useNavigate, Routes, Route } from "react-router";
import { useTheme } from "./context/ThemeContext";
import User from "./user";
import "./App.css";

function Counter() {
  const { count, increment, decrement } = useTheme();

  return (
    <section aria-label="Counter">
      <p>Count: {count}</p>
      <button type="button" onClick={decrement}>
        Decrement
      </button>
      <button type="button" onClick={increment}>
        Increment
      </button>
    </section>
  );
}

function Home() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="app-content">
      <h1>Welcome</h1>
      <button type="button" onClick={() => navigate("/user")}>
        user
      </button>
      <button type="button" onClick={toggleTheme}>
        Switch to {theme === "light" ? "dark" : "light"} mode
      </button>
      <Counter />
    </main>
  );
}

function App() {
  const { theme } = useTheme();

  return (
    <div className="app-shell" data-theme={theme}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </div>
  );
}

export default App;
